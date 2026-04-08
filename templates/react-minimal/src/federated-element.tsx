import { CrudType, useAppUIContext } from '@accelbyte/sdk-extend-app-ui'

export function FederatedElement() {
  const { isCurrentUserHasPermission } = useAppUIContext()

  return (
    <div>
      <h1>Hello world!</h1>

      <h2 hidden={isCurrentUserHasPermission({ action: CrudType.READ, resource: 'ADMIN:RANDOMRESOURCE' })}>
        This is also a hello world but hidden because you may not have the permission
      </h2>
    </div>
  )
}
