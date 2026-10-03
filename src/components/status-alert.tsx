import { CircleAlertIcon, InfoIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function StatusAlert({
  tone = 'empty',
  title,
  description,
}: {
  tone?: 'empty' | 'error'
  title: string
  description: string
}) {
  return (
    <Alert variant={tone === 'error' ? 'destructive' : 'default'} className="px-4 py-4">
      {tone === 'error' ? <CircleAlertIcon /> : <InfoIcon />}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}
