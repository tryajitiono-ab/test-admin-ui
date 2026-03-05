import type { SdkSetConfigParam } from '@accelbyte/sdk'
import type { ConfigInfo } from '@accelbyte/sdk-config'
import {
  Key_CommonConfigurationAdmin,
  useCommonConfigurationAdminApi_CreateConfigMutation,
  useCommonConfigurationAdminApi_DeleteConfig_ByConfigKeyMutation,
  useCommonConfigurationAdminApi_GetConfig_ByConfigKey,
  useCommonConfigurationAdminApi_PatchConfig_ByConfigKeyMutation
} from '@accelbyte/sdk-config/react-query'
import { IamUserAuthorizationClient } from '@accelbyte/sdk-iam'
import { useUsersAdminApi_GetUsersMe_v3 } from '@accelbyte/sdk-iam/react-query'
import { useQueryClient } from '@tanstack/react-query'
import type { TableColumnsType } from 'antd'
import { Button, Divider, Form, Input, Modal, Space, Table, Typography } from 'antd'
import { isAxiosError } from 'axios'
import { useEffect, useState, type PropsWithChildren } from 'react'
import { Link, Outlet, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router'
import { sdk } from './constants'
import { useGlobalContext } from './context'

export function FederatedElement() {
  useUsersAdminApi_GetUsersMe_v3(sdk, {})
  const [, setSearchParams] = useSearchParams()

  useEffect(() => {
    const { code, state } = Object.fromEntries(new URL(window.location.href).searchParams)
    if (!code || !state) return

    new IamUserAuthorizationClient(sdk).exchangeAuthorizationCode({ code, state })

    setSearchParams(prev => {
      const newSearchParams = new URLSearchParams(prev)
      newSearchParams.delete('code')
      newSearchParams.delete('state')

      return newSearchParams
    })
  }, [])

  return (
    <main className="p-4">
      <Routes>
        <Route path="*" element={<GameConfigs />}>
          <Route path=":configKey" element={<GameConfigDetail />} />
        </Route>
      </Routes>
    </main>
  )
}

type TopLevelGameConfigValues = Array<{ key: string }>
type GameConfigValues = Array<{ key: string; value: string }>

function GameConfigs() {
  const {
    hostContext: { namespace },
    sdk
  } = useGlobalContext()
  const queryClient = useQueryClient()
  const configKey = 'gameconfigs'
  const navigate = useNavigate()
  const params = useParams()

  const configKeyInput = {
    configKey,
    coreConfig: { namespace }
  }
  const queryKey = [Key_CommonConfigurationAdmin.Config_ByConfigKey, configKeyInput] as const

  const configFetcher = useCommonConfigurationAdminApi_GetConfig_ByConfigKey(sdk, configKeyInput)
  const addConfigMutation = useCommonConfigurationAdminApi_CreateConfigMutation(sdk)
  const patchConfigMutation = useCommonConfigurationAdminApi_PatchConfig_ByConfigKeyMutation(sdk)
  const deleteChildConfigMutation = useCommonConfigurationAdminApi_DeleteConfig_ByConfigKeyMutation(sdk)
  const mutationArgs: SdkSetConfigParam = { coreConfig: { namespace } }

  const showTable = configFetcher.data !== undefined || (isAxiosError(configFetcher.error) && configFetcher.error.status === 404)

  const configs: TopLevelGameConfigValues = configFetcher.data ? JSON.parse(configFetcher.data.value) : []

  const optimistic = (newValue: string, onSuccess?: () => void) => ({
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      const snapshot = queryClient.getQueryData<ConfigInfo>(queryKey)
      queryClient.setQueryData<ConfigInfo>(queryKey, old =>
        old ? { ...old, value: newValue } : { key: configKey, namespace, isPublic: true, value: newValue, createdAt: '', updatedAt: '' }
      )
      return { snapshot }
    },
    onError: (_err: unknown, _vars: unknown, ctx: unknown) => {
      queryClient.setQueryData(queryKey, (ctx as { snapshot: ConfigInfo | undefined } | undefined)?.snapshot)
    },
    onSuccess,
    onSettled: () => queryClient.invalidateQueries({ queryKey })
  })

  const handleDelete = (index: number, childConfigKey: string) => {
    const newConfigs = [...configs]
    newConfigs.splice(index, 1)

    patchConfigMutation.mutate(
      { ...mutationArgs, configKey, data: { isPublic: true, value: JSON.stringify(newConfigs) } },
      optimistic(JSON.stringify(newConfigs), () => {
        deleteChildConfigMutation.mutate({ ...mutationArgs, configKey: childConfigKey })

        if (params.configKey === childConfigKey) {
          navigate('/')
        }
      })
    )
  }

  const columns: TableColumnsType<TopLevelGameConfigValues[number]> = [
    {
      title: 'Key',
      dataIndex: 'key'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_: unknown, record, index) => (
        <Space>
          <Link to={`/${record.key}`}>
            <Button>View</Button>
          </Link>
          <DeleteButton onDelete={() => handleDelete(index, record.key)}>Delete</DeleteButton>
        </Space>
      )
    }
  ]

  return (
    <>
      <Typography.Title level={2}>Game configs</Typography.Title>

      {showTable ? (
        <Table
          columns={columns}
          dataSource={configs}
          rowKey="key"
          pagination={false}
          footer={() => (
            <Form
              onFinish={values => {
                const newValue = JSON.stringify(configs.concat(values))

                if (!configFetcher.data) {
                  addConfigMutation.mutate(
                    { ...mutationArgs, data: { key: configKey, isPublic: true, value: JSON.stringify([values]) } },
                    optimistic(JSON.stringify([values]), () => navigate(`/${values.key}`))
                  )
                  return
                }

                patchConfigMutation.mutate(
                  { ...mutationArgs, configKey, data: { isPublic: true, value: newValue } },
                  optimistic(newValue, () => navigate(`/${values.key}`))
                )
              }}
              initialValues={{ key: '' }}>
              <div className="flex gap-x-2">
                <Form.Item name="key" className="mb-0">
                  <Input placeholder="Config name" />
                </Form.Item>
                <Button htmlType="submit" type="primary">
                  Add config
                </Button>
              </div>
            </Form>
          )}
        />
      ) : configFetcher.error ? (
        <div>Error fetching config</div>
      ) : configFetcher.isLoading ? (
        'Loading...'
      ) : null}

      <Outlet />
    </>
  )
}

function GameConfigDetail() {
  const {
    hostContext: { namespace },
    sdk
  } = useGlobalContext()
  const queryClient = useQueryClient()
  const { configKey = '' } = useParams()

  const configKeyInput = {
    configKey,
    coreConfig: { namespace }
  }
  const queryKey = [Key_CommonConfigurationAdmin.Config_ByConfigKey, configKeyInput] as const
  const navigate = useNavigate()

  const configFetcher = useCommonConfigurationAdminApi_GetConfig_ByConfigKey(sdk, configKeyInput)
  const addConfigMutation = useCommonConfigurationAdminApi_CreateConfigMutation(sdk)
  const patchConfigMutation = useCommonConfigurationAdminApi_PatchConfig_ByConfigKeyMutation(sdk)
  const mutationArgs: SdkSetConfigParam = { coreConfig: { namespace } }

  const [editingValues, setEditingValues] = useState<Record<number, { key?: string; value?: string }>>({})

  const showTable = configFetcher.data !== undefined || (isAxiosError(configFetcher.error) && configFetcher.error.status === 404)

  const configs: GameConfigValues = configFetcher.data ? JSON.parse(configFetcher.data.value) : []

  const optimistic = (newValue: string, onSuccess?: () => void) => ({
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      const snapshot = queryClient.getQueryData<ConfigInfo>(queryKey)
      queryClient.setQueryData<ConfigInfo>(queryKey, old =>
        old ? { ...old, value: newValue } : { key: configKey, namespace, isPublic: true, value: newValue, createdAt: '', updatedAt: '' }
      )
      return { snapshot }
    },
    onError: (_err: unknown, _vars: unknown, ctx: unknown) => {
      queryClient.setQueryData(queryKey, (ctx as { snapshot: ConfigInfo | undefined })?.snapshot)
    },
    onSuccess,
    onSettled: () => queryClient.invalidateQueries({ queryKey })
  })

  const handleUpdate = (index: number) => {
    const newConfigs = [...configs]
    newConfigs[index] = {
      key: editingValues[index]?.key ?? configs[index].key,
      value: editingValues[index]?.value ?? configs[index].value
    }

    patchConfigMutation.mutate(
      { ...mutationArgs, configKey, data: { isPublic: true, value: JSON.stringify(newConfigs) } },
      optimistic(JSON.stringify(newConfigs))
    )
  }

  const handleDelete = (index: number) => {
    const newConfigs = [...configs]
    newConfigs.splice(index, 1)

    patchConfigMutation.mutate(
      { ...mutationArgs, configKey: configKey!, data: { isPublic: true, value: JSON.stringify(newConfigs) } },
      optimistic(JSON.stringify(newConfigs))
    )
  }

  const columns: TableColumnsType<GameConfigValues[number]> = [
    {
      title: 'Key',
      dataIndex: 'key',
      render: (key: string, _record, index) => (
        <Input
          value={editingValues[index]?.key ?? key}
          onChange={e => setEditingValues(prev => ({ ...prev, [index]: { ...prev[index], key: e.target.value } }))}
          placeholder="Config name"
        />
      )
    },
    {
      title: 'Value',
      dataIndex: 'value',
      render: (value: string, _record, index) => (
        <Input
          value={editingValues[index]?.value ?? value}
          onChange={e => setEditingValues(prev => ({ ...prev, [index]: { ...prev[index], value: e.target.value } }))}
          placeholder="Config value"
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_: unknown, _record, index) => (
        <Space>
          <Button onClick={() => handleUpdate(index)}>Update</Button>
          <DeleteButton onDelete={() => handleDelete(index)}>Delete</DeleteButton>
        </Space>
      )
    }
  ]

  return (
    <>
      <Divider />

      <div className="flex justify-between">
        <Typography.Title level={3}>Game config: {configKey}</Typography.Title>

        <Button onClick={() => navigate('/')}>Close</Button>
      </div>

      {showTable ? (
        <Table
          columns={columns}
          dataSource={configs}
          rowKey="key"
          pagination={false}
          footer={() => (
            <Form
              onFinish={values => {
                const newValue = JSON.stringify(configs.concat(values))

                if (!configFetcher.data) {
                  addConfigMutation.mutate(
                    { ...mutationArgs, data: { key: configKey, isPublic: true, value: JSON.stringify([values]) } },
                    optimistic(JSON.stringify([values]))
                  )
                  return
                }

                patchConfigMutation.mutate({ ...mutationArgs, configKey, data: { isPublic: true, value: newValue } }, optimistic(newValue))
              }}
              initialValues={{ key: '', value: '' }}>
              <div className="flex gap-x-2">
                <Form.Item name="key" className="mb-0">
                  <Input placeholder="Config name" />
                </Form.Item>
                <Form.Item name="value" className="mb-0">
                  <Input placeholder="Config value" />
                </Form.Item>
                <Button htmlType="submit" type="primary">
                  Add config
                </Button>
              </div>
            </Form>
          )}
        />
      ) : configFetcher.error ? (
        <div>Error fetching config</div>
      ) : configFetcher.isLoading ? (
        'Loading...'
      ) : null}
    </>
  )
}

function DeleteButton({ onDelete, children }: PropsWithChildren<{ onDelete: () => void }>) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Modal
        title="Confirm delete config"
        destroyOnHidden
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        okText="Delete"
        okButtonProps={{
          danger: true
        }}
        onOk={async () => {
          onDelete()
          setIsOpen(false)
        }}>
        <Typography.Paragraph>Are you sure you want to delete this config?</Typography.Paragraph>
      </Modal>

      <Button danger onClick={() => setIsOpen(true)}>
        {children}
      </Button>
    </>
  )
}
