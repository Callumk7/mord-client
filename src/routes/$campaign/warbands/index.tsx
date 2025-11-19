import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$campaign/warbands/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$campaign/warbands/"!</div>
}
