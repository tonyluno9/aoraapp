import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { ToastProvider } from '@/components/ui'
import { AppShell } from '@/components/layout/AppShell'
import { WelcomeScreen } from '@/screens/WelcomeScreen'
import { SignInScreen } from '@/screens/SignInScreen'
import { ScheduleSetupScreen } from '@/screens/ScheduleSetupScreen'
import { TodayScreen } from '@/screens/TodayScreen'
import { WeekScreen } from '@/screens/WeekScreen'
import { OverloadScreen } from '@/screens/OverloadScreen'
import { TaskDetailScreen } from '@/screens/TaskDetailScreen'
import { PendingScreen } from '@/screens/PendingScreen'
import { ConnectionsScreen } from '@/screens/ConnectionsScreen'
import { PlansScreen } from '@/screens/PlansScreen'
import { ProfileScreen } from '@/screens/ProfileScreen'
import { useAppStore } from '@/store/useAppStore'

function Start() {
  const onboarded = useAppStore((state) => state.onboarded)
  const authed = useAppStore((state) => state.authed)
  if (!onboarded) return <Navigate to="/bienvenida" replace />
  if (!authed) return <Navigate to="/entrar" replace />
  return <Navigate to="/hoy" replace />
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter
        basename={import.meta.env.BASE_URL.replace(/\/$/, '')}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/bienvenida" element={<WelcomeScreen />} />
            <Route path="/entrar" element={<SignInScreen />} />

            <Route element={<AppShell />}>
              <Route path="/hoy" element={<TodayScreen />} />
              <Route path="/capturar" element={<TodayScreen />} />
              <Route path="/semana" element={<WeekScreen />} />
              <Route path="/sobrecarga" element={<OverloadScreen />} />
              <Route path="/pendientes" element={<PendingScreen />} />
              <Route path="/tarea/:id" element={<TaskDetailScreen />} />
              <Route path="/configurar-horario" element={<ScheduleSetupScreen />} />
              <Route path="/conexiones" element={<ConnectionsScreen />} />
              <Route path="/planes" element={<PlansScreen />} />
              <Route path="/perfil" element={<ProfileScreen />} />
            </Route>

            <Route path="*" element={<Navigate to="/hoy" replace />} />
          </Routes>
        </ToastProvider>
      </BrowserRouter>
    </MotionConfig>
  )
}
