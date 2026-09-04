import { ToastProvider } from '@/components/ui'
import { DesignSystemScreen } from '@/screens/DesignSystemScreen'

export default function App() {
  return (
    <ToastProvider>
      <DesignSystemScreen />
    </ToastProvider>
  )
}
