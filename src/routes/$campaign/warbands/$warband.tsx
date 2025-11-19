import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$campaign/warbands/$warband')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$campaign/warbands/$warband"!</div>
}
