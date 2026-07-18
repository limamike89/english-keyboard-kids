import { Routes, Route, Navigate } from 'react-router-dom'
import { RootLayout } from '../layouts/root.layout'
import { HomePage } from '../features/home/home.page'
import { GamePage } from '../features/game/game.page'
import { ProfilePage } from '../features/profile/profile.page'
import { DashboardPage } from '../features/dashboard/dashboard.page'
import { SettingsPage } from '../features/settings/settings.page'
import { AnalyticsPage } from '../features/analytics/analytics.page'
import { ParentLoginPage } from '../features/parent/ParentLoginPage'
import { ParentRegisterPage } from '../features/parent/ParentRegisterPage'
import { ParentDashboardPage } from '../features/parent/ParentDashboardPage'
import { ChildProgressPage } from '../features/parent/ChildProgressPage'
import { ParentSettingsPage } from '../features/parent/ParentSettingsPage'
import { TeacherDashboardPage } from '../features/teacher/TeacherDashboardPage'
import { TeacherClassDetailPage } from '../features/teacher/TeacherClassDetailPage'
import { TeacherClassAnalyticsPage } from '../features/teacher/TeacherClassAnalyticsPage'
import { TeacherStudentProgressPage } from '../features/teacher/TeacherStudentProgressPage'
import { CmsLayout } from '../features/cms/cms.layout'
import { CmsLoginPage } from '../features/cms/cms-login.page'
import { CmsDashboardPage } from '../features/cms/cms.dashboard.page'
import { LettersPage } from '../features/cms/pages/letters.page'
import { NumbersPage } from '../features/cms/pages/numbers.page'
import { WordsPage } from '../features/cms/pages/words.page'
import { CategoriesPage } from '../features/cms/pages/categories.page'
import { LanguagesPage } from '../features/cms/pages/languages.page'
import { LevelsPage } from '../features/cms/pages/levels.page'
import { AchievementsPage } from '../features/cms/pages/achievements.page'
import { MediaPage } from '../features/cms/pages/media.page'
import { ConfigPage } from '../features/cms/pages/config.page'
import { ImportExportPage } from '../features/cms/pages/import-export.page'
import { AuditPage } from '../features/cms/pages/audit.page'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:lessonId" element={<GamePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/parent/login" element={<ParentLoginPage />} />
        <Route path="/parent/register" element={<ParentRegisterPage />} />
        <Route path="/parent/dashboard" element={<ParentDashboardPage />} />
        <Route path="/parent/children/:childId" element={<ChildProgressPage />} />
        <Route path="/parent/settings" element={<ParentSettingsPage />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
        <Route path="/teacher/classes/:classId" element={<TeacherClassDetailPage />} />
        <Route path="/teacher/classes/:classId/analytics" element={<TeacherClassAnalyticsPage />} />
        <Route path="/teacher/classes/:classId/students/:studentId" element={<TeacherStudentProgressPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      <Route path="/cms/login" element={<CmsLoginPage />} />
      <Route path="/cms" element={<CmsLayout />}>
        <Route index element={<CmsDashboardPage />} />
        <Route path="letters" element={<LettersPage />} />
        <Route path="numbers" element={<NumbersPage />} />
        <Route path="words" element={<WordsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="languages" element={<LanguagesPage />} />
        <Route path="levels" element={<LevelsPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="config" element={<ConfigPage />} />
        <Route path="import-export" element={<ImportExportPage />} />
        <Route path="audit" element={<AuditPage />} />
      </Route>
    </Routes>
  )
}
