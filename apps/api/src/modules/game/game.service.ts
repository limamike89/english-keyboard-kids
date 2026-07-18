import { Injectable, Logger, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { GameEngine } from '../../game-engine/core/engine';
import { PrismaPersistenceAdapter } from '../../game-engine/persistence/prisma-persistence.adapter';
import { AlphabetMode } from '../../game-engine/modes/alphabet.mode';
import { NumbersMode } from '../../game-engine/modes/numbers.mode';
import { MixedMode } from '../../game-engine/modes/mixed.mode';
import { GameStartInput, SubmitAnswerInput } from '../../game-engine/core/types';
import { GameNotFoundError, GameAlreadyFinishedError, UnauthorizedGameAccessError } from '../../game-engine/errors/game-errors';
import { GameMode } from '@prisma/client';
import {
  GameStartResponse,
  GameSubmitResponse,
  GameStateResponse,
  GameFinishResponse,
} from './interfaces/game.interface';

@Injectable()
export class GameService implements OnModuleInit {
  private readonly logger = new Logger(GameService.name);
  private engine: GameEngine;

  constructor(private readonly prisma: PrismaService) {
    const persistence = new PrismaPersistenceAdapter(this.prisma);
    this.engine = new GameEngine(persistence);
  }

  onModuleInit(): void {
    this.engine.registerMode(new AlphabetMode());
    this.engine.registerMode(new NumbersMode());
    this.engine.registerMode(new MixedMode());
    this.engine.setOnCompleted(async (sessionId, result) => {
      try {
        await this.engine.saveResults(sessionId);
        this.logger.log(`Auto-saved results for session ${sessionId}`);
      } catch (error) {
        this.logger.error(`Failed to auto-save results for session ${sessionId}: ${(error as Error).message}`);
      }
    });
    this.logger.log('GameEngine initialized with modes: Alphabet, Numbers, Mixed');
  }

  private engineModeFromLesson(lesson: { mode: string }): 'ALPHABET' | 'NUMBERS' | 'MIXED' {
    switch (lesson.mode) {
      case 'LETTERS': return 'ALPHABET';
      case 'NUMBERS': return 'NUMBERS';
      case 'MIXED': return 'MIXED';
      default: return 'ALPHABET';
    }
  }

  private lessonModeFromEngine(engineMode: string): string {
    switch (engineMode) {
      case 'ALPHABET': return 'LETTERS';
      case 'NUMBERS': return 'NUMBERS';
      case 'MIXED': return 'MIXED';
      default: return engineMode;
    }
  }

  async start(userId: string, lessonId: string): Promise<GameStartResponse> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        questions: {
          where: { isActive: true, deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!lesson || lesson.deletedAt) {
      throw new NotFoundException('Lesson', lessonId);
    }

    if (lesson.questions.length === 0) {
      throw new BadRequestException('Lesson has no questions');
    }

    const modeType = this.engineModeFromLesson(lesson);

    const input: GameStartInput = {
      lessonId,
      userId,
      mode: modeType,
      questions: lesson.questions.map((q) => ({
        id: q.id,
        type: q.type as 'LETTER' | 'NUMBER',
        audioKey: q.audioKey,
        displayText: q.displayText,
        correctAnswer: q.correctAnswer,
        order: q.order,
        hint: q.hint,
      })),
      sessionId: uuidv4(),
    };

    try {
      const result = await this.engine.start(input);
      return {
        gameSessionId: result.gameSessionId,
        lessonId: input.lessonId,
        mode: this.lessonModeFromEngine(result.mode) as GameMode,
        status: 'PLAYING' as const,
        currentQuestion: result.currentQuestion,
        score: result.score,
        streak: result.streak,
        questionsAnswered: result.questionsAnswered,
        totalQuestions: result.totalQuestions,
      };
    } catch (error) {
      this.logger.error(`Failed to start game: ${(error as Error).message}`);
      throw new BadRequestException('Could not start game');
    }
  }

  async submit(
    userId: string,
    gameSessionId: string,
    questionId: string,
    answer: string,
  ): Promise<GameSubmitResponse> {
    try {
      const input: SubmitAnswerInput = { gameSessionId, questionId, answer };
      const result = await this.engine.submitAnswer(input);

      return {
        gameSessionId: result.gameSessionId,
        status: result.status,
        isCorrect: result.isCorrect,
        attemptNumber: result.attemptNumber,
        correctAnswer: result.correctAnswer,
        pointsEarned: result.pointsEarned,
        streakBonus: result.streakBonus,
        totalScore: result.totalScore,
        streak: result.streak,
        nextQuestion: result.nextQuestion,
        result: result.result,
        message: result.message,
      };
    } catch (error) {
      if (error instanceof GameNotFoundError) {
        throw new NotFoundException('GameSession', gameSessionId);
      }
      if (error instanceof GameAlreadyFinishedError) {
        throw new BadRequestException('Game session is already finished');
      }
      this.logger.error(`Submit error: ${(error as Error).message}`);
      throw new BadRequestException('Could not submit answer');
    }
  }

  async getState(userId: string, gameSessionId: string): Promise<GameStateResponse> {
    try {
      const engineState = this.engine.getState(gameSessionId);
      const stateStr = String(engineState.state);

      let mappedStatus: 'PLAYING' | 'CORRECT' | 'INCORRECT' | 'COMPLETED' | 'ABANDONED';
      if (['PLAYING', 'WAITING_FOR_ANSWER', 'NEXT_QUESTION'].includes(stateStr)) {
        mappedStatus = 'PLAYING';
      } else if (stateStr === 'CORRECT') {
        mappedStatus = 'CORRECT';
      } else if (stateStr === 'WRONG') {
        mappedStatus = 'INCORRECT';
      } else if (['GAME_FINISHED', 'SAVING_RESULTS', 'END'].includes(stateStr)) {
        mappedStatus = 'COMPLETED';
      } else {
        mappedStatus = 'PLAYING';
      }

      return {
        gameSessionId: engineState.gameSessionId,
        status: mappedStatus,
        currentQuestion: engineState.currentQuestion,
        score: engineState.score,
        streak: engineState.streak,
        questionsAnswered: engineState.questionsAnswered,
        totalQuestions: engineState.totalQuestions,
      };
    } catch (error) {
      if (error instanceof GameNotFoundError) {
        throw new NotFoundException('GameSession', gameSessionId);
      }
      throw new BadRequestException('Could not get game state');
    }
  }

  async finish(userId: string, gameSessionId: string): Promise<GameFinishResponse> {
    try {
      const result = await this.engine.finish(gameSessionId);

      return {
        gameSessionId,
        status: 'ABANDONED',
        finalScore: result.totalScore,
        questionsAnswered: result.totalCorrect + result.totalIncorrect,
        totalQuestions: result.totalCorrect + result.totalIncorrect,
      };
    } catch (error) {
      if (error instanceof GameNotFoundError) {
        throw new NotFoundException('GameSession', gameSessionId);
      }
      if (error instanceof GameAlreadyFinishedError) {
        throw new BadRequestException('Game session is already completed');
      }
      throw new BadRequestException('Could not finish game');
    }
  }
}
