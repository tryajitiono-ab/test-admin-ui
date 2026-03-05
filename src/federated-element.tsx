import type { SdkSetConfigParam } from '@accelbyte/sdk'
import {
  Key_CommonConfigurationAdmin,
  useCommonConfigurationAdminApi_CreateConfigMutation,
  useCommonConfigurationAdminApi_GetConfig_ByConfigKey,
  useCommonConfigurationAdminApi_PatchConfig_ByConfigKeyMutation
} from '@accelbyte/sdk-config/react-query'
import { IamUserAuthorizationClient } from '@accelbyte/sdk-iam'
import { useUsersAdminApi_GetUsersMe_v3 } from '@accelbyte/sdk-iam/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Form, Input, Modal, Typography } from 'antd'
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

  const configKeyInput = {
    configKey,
    coreConfig: {
      namespace
    }
  }
  const configFetcher = useCommonConfigurationAdminApi_GetConfig_ByConfigKey(sdk, configKeyInput)
  const addConfigMutation = useCommonConfigurationAdminApi_CreateConfigMutation(sdk)
  const patchConfigMutation = useCommonConfigurationAdminApi_PatchConfig_ByConfigKeyMutation(sdk)
  const mutationArgs: SdkSetConfigParam = {
    coreConfig: {
      namespace
    }
  }

  const configData =
    configFetcher.data || (isAxiosError(configFetcher.error) && configFetcher.error.status === 404)
      ? (() => {
          const configs = (configFetcher.data ? JSON.parse(configFetcher.data.value) : []) as TopLevelGameConfigValues

          return configs
            .map((config, index) => (
              <li key={config.key}>
                <Form
                  onFinish={values => {
                    const newConfigs = [...configs]
                    newConfigs[index] = values

                    patchConfigMutation.mutate(
                      {
                        ...mutationArgs,
                        configKey,
                        data: {
                          isPublic: true,
                          value: JSON.stringify(newConfigs)
                        }
                      },
                      {
                        onSuccess: () => {
                          queryClient.invalidateQueries({ queryKey: [Key_CommonConfigurationAdmin.Config_ByConfigKey, configKeyInput] })
                        }
                      }
                    )
                  }}
                  initialValues={{
                    key: config.key
                  }}>
                  <div className="flex gap-x-2">
                    <Form.Item name="key">
                      <Input placeholder="Config name" />
                    </Form.Item>

                    <Link to={`/${config.key}`}>
                      <Button>View</Button>
                    </Link>
                    <Button htmlType="submit">Update config</Button>
                    <DeleteButton
                      onDelete={() => {
                        const newConfigs = [...configs]
                        newConfigs.splice(index, 1)

                        patchConfigMutation.mutate(
                          {
                            ...mutationArgs,
                            configKey,
                            data: {
                              isPublic: true,
                              value: JSON.stringify(newConfigs)
                            }
                          },
                          {
                            onSuccess: () => {
                              queryClient.invalidateQueries({ queryKey: [Key_CommonConfigurationAdmin.Config_ByConfigKey, configKeyInput] })
                            }
                          }
                        )
                      }}>
                      Delete config
                    </DeleteButton>
                  </div>
                </Form>
              </li>
            ))
            .concat(
              <li>
                <Form
                  onFinish={values => {
                    if (!configFetcher.data) {
                      addConfigMutation.mutate(
                        {
                          ...mutationArgs,
                          data: {
                            key: configKey,
                            isPublic: true,
                            value: JSON.stringify([values])
                          }
                        },
                        {
                          onSuccess: () => {
                            queryClient.invalidateQueries({ queryKey: [Key_CommonConfigurationAdmin.Config_ByConfigKey, configKeyInput] })
                            navigate(`/${values.key}`)
                          }
                        }
                      )
                      return
                    }

                    patchConfigMutation.mutate(
                      {
                        ...mutationArgs,
                        configKey,
                        data: {
                          isPublic: true,
                          value: JSON.stringify(configs.concat(values))
                        }
                      },
                      {
                        onSuccess: () => {
                          queryClient.invalidateQueries({ queryKey: [Key_CommonConfigurationAdmin.Config_ByConfigKey, configKeyInput] })
                        }
                      }
                    )
                  }}
                  initialValues={{
                    key: '',
                    value: ''
                  }}>
                  <div className="flex gap-x-2">
                    <Form.Item name="key">
                      <Input placeholder="Config name" />
                    </Form.Item>

                    <Button htmlType="submit">Add config</Button>
                  </div>
                </Form>
              </li>
            )
        })()
      : null

  return (
    <>
      <h1>Game configs</h1>

      <div>
        {configData ? (
          <ul>{configData}</ul>
        ) : configFetcher.error ? (
          <div>Error fetching config</div>
        ) : configFetcher.isLoading ? (
          'Loading...'
        ) : null}
      </div>

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
    coreConfig: {
      namespace
    }
  }
  const configFetcher = useCommonConfigurationAdminApi_GetConfig_ByConfigKey(sdk, configKeyInput)
  const addConfigMutation = useCommonConfigurationAdminApi_CreateConfigMutation(sdk)
  const patchConfigMutation = useCommonConfigurationAdminApi_PatchConfig_ByConfigKeyMutation(sdk)
  const mutationArgs: SdkSetConfigParam = {
    coreConfig: {
      namespace
    }
  }

  const configData =
    configFetcher.data || (isAxiosError(configFetcher.error) && configFetcher.error.status === 404)
      ? (() => {
          const configs = (configFetcher.data ? JSON.parse(configFetcher.data.value) : []) as GameConfigValues

          return configs
            .map((config, index) => (
              <li key={config.key}>
                <Form
                  onFinish={values => {
                    const newConfigs = [...configs]
                    newConfigs[index] = values

                    patchConfigMutation.mutate(
                      {
                        ...mutationArgs,
                        configKey,
                        data: {
                          isPublic: true,
                          value: JSON.stringify(newConfigs)
                        }
                      },
                      {
                        onSuccess: () => {
                          queryClient.invalidateQueries({ queryKey: [Key_CommonConfigurationAdmin.Config_ByConfigKey, configKeyInput] })
                        }
                      }
                    )
                  }}
                  initialValues={{
                    key: config.key,
                    value: config.value
                  }}>
                  <div className="flex gap-x-2">
                    <Form.Item name="key">
                      <Input placeholder="Config name" />
                    </Form.Item>
                    <Form.Item name="value">
                      <Input placeholder="Config value" />
                    </Form.Item>

                    <Button htmlType="submit">Update config</Button>
                    <DeleteButton
                      onDelete={() => {
                        const newConfigs = [...configs]
                        newConfigs.splice(index, 1)

                        patchConfigMutation.mutate({
                          ...mutationArgs,
                          configKey: configKey!,
                          data: {
                            isPublic: true,
                            value: JSON.stringify(newConfigs)
                          }
                        })
                      }}>
                      Delete config
                    </DeleteButton>
                  </div>
                </Form>
              </li>
            ))
            .concat(
              <li>
                <Form
                  onFinish={values => {
                    if (!configFetcher.data) {
                      addConfigMutation.mutate(
                        {
                          ...mutationArgs,
                          data: {
                            key: configKey,
                            isPublic: true,
                            value: JSON.stringify([values])
                          }
                        },
                        {
                          onSuccess: () => {
                            queryClient.invalidateQueries({ queryKey: [Key_CommonConfigurationAdmin.Config_ByConfigKey, configKeyInput] })
                          }
                        }
                      )
                      return
                    }

                    patchConfigMutation.mutate({
                      ...mutationArgs,
                      configKey,
                      data: {
                        isPublic: true,
                        value: JSON.stringify(configs.concat(values))
                      }
                    })
                  }}
                  initialValues={{
                    key: '',
                    value: ''
                  }}>
                  <div className="flex gap-x-2">
                    <Form.Item name="key">
                      <Input placeholder="Config name" />
                    </Form.Item>
                    <Form.Item name="value">
                      <Input placeholder="Config value" />
                    </Form.Item>

                    <Button htmlType="submit">Add config</Button>
                  </div>
                </Form>
              </li>
            )
        })()
      : null

  return (
    <>
      <hr />

      <h2>Game config {configKey}</h2>

      <div>
        {configData ? (
          <ul>{configData}</ul>
        ) : configFetcher.error ? (
          <div>Error fetching config</div>
        ) : configFetcher.isLoading ? (
          'Loading...'
        ) : null}
      </div>
    </>
  )
}

function DeleteButton({ onDelete, children }: PropsWithChildren<{ onDelete: () => void }>) {
  const [isOpen, setIsOpen] = useState(false)
  const [deleteInputValue, setDeleteInputValue] = useState('')

  return (
    <>
      <Modal
        title="Confirm delete config"
        destroyOnHidden
        open={isOpen}
        okText="Delete"
        okButtonProps={{
          danger: true,
          disabled: deleteInputValue !== 'DELETE'
        }}
        onOk={async () => {
          onDelete()

          setDeleteInputValue('')
          setIsOpen(false)
        }}>
        <Typography.Paragraph>
          Are you sure you want to delete this config? Type <strong>DELETE</strong> to proceed.
        </Typography.Paragraph>

        <Input placeholder="DELETE" value={deleteInputValue} onChange={e => setDeleteInputValue(e.target.value)} />
      </Modal>

      <Button onClick={() => setIsOpen(true)}>{children}</Button>
    </>
  )
}
