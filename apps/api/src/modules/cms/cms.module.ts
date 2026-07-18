import { Module } from '@nestjs/common'
import { CmsAuthModule } from './cms-auth/cms-auth.module'
import { LettersModule } from './letters/letters.module'
import { NumbersModule } from './numbers/numbers.module'
import { WordsModule } from './words/words.module'
import { CategoriesModule } from './categories/categories.module'
import { LanguagesModule } from './languages/languages.module'
import { LevelsModule } from './levels/levels.module'
import { AchievementsModule } from './achievements/achievements.module'
import { ConfigModule } from './config/config.module'

@Module({
  imports: [
    CmsAuthModule,
    LettersModule,
    NumbersModule,
    WordsModule,
    CategoriesModule,
    LanguagesModule,
    LevelsModule,
    AchievementsModule,
    ConfigModule,
  ],
})
export class CmsModule {}
