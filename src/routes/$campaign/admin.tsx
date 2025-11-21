import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$campaign/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$campaign/admin"!</div>
}
