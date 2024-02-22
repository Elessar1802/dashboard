import { UserStatus } from '@devtron-labs/devtron-fe-common-lib'
import React, { createContext, ReactNode, useContext, useMemo, useRef, useState } from 'react'
import { importComponentFromFELibrary } from '../../../../../../components/common'
import { ActionTypes, EntityTypes, PermissionType } from '../../../constants'
import {
    ChartGroupPermissionsFilter,
    DirectPermissionsRoleFilter,
    K8sPermissionFilter,
    PermissionGroup,
    User,
} from '../../../types'
import { getFormattedTimeToLive } from '../../../utils'
import { PermissionConfigurationFormContext } from './types'

const changeTemporaryStatusToInactive = importComponentFromFELibrary(
    'changeTemporaryStatusToInactive',
    () => ({}),
    'function',
)

const context = createContext<PermissionConfigurationFormContext>(null)

export const PermissionConfigurationFormProvider = ({
    children,
    data = {} as User | PermissionGroup,
}: {
    children: ReactNode
    data: User | PermissionGroup
}) => {
    const [permissionType, setPermissionType] = useState<PermissionType>(PermissionType.SPECIFIC)

    const [directPermission, setDirectPermission] = useState<DirectPermissionsRoleFilter[]>([])
    const [chartPermission, setChartPermission] = useState<ChartGroupPermissionsFilter>({
        entity: EntityTypes.CHART_GROUP,
        action: ActionTypes.VIEW,
        entityName: [],
    })
    const [k8sPermission, setK8sPermission] = useState<K8sPermissionFilter[]>([])

    const currentK8sPermissionRef = useRef<K8sPermissionFilter[]>([])
    const [userGroups, setUserGroups] = useState<User['userRoleGroups']>([])
    const [userStatus, setUserStatus] = useState<User['userStatus']>()
    const [timeToLive, setTimeToLive] = useState<User['timeToLive']>()

    const handleUserStatusUpdate = (updatedStatus: User['userStatus'], updatedTimeToLive?: User['timeToLive']) => {
        setUserStatus(updatedStatus)
        setTimeToLive(getFormattedTimeToLive(updatedTimeToLive))

        // Mark the permission group mapping and direct permission level status to inactive for temporary accesses
        // Not required if the user level timeToLive is less than the permission level timeToLive
        if (updatedStatus === UserStatus.inactive) {
            setUserGroups(
                userGroups.map((userGroup) => ({
                    ...userGroup,
                    ...changeTemporaryStatusToInactive(userGroup.status, userGroup.timeToLive),
                })),
            )
            setK8sPermission(
                k8sPermission.map((permission) => ({
                    ...permission,
                    // TODO (v3): Update the status and ttl as well
                })),
            )
        }
    }

    const value = useMemo(
        () => ({
            permissionType,
            setPermissionType,
            directPermission,
            setDirectPermission,
            chartPermission,
            setChartPermission,
            k8sPermission,
            setK8sPermission,
            currentK8sPermissionRef,
            userGroups,
            setUserGroups,
            userStatus,
            timeToLive,
            handleUserStatusUpdate,
            data,
        }),
        [
            permissionType,
            setPermissionType,
            directPermission,
            setDirectPermission,
            chartPermission,
            setChartPermission,
            k8sPermission,
            setK8sPermission,
            currentK8sPermissionRef,
            userGroups,
            setUserGroups,
            userStatus,
            timeToLive,
            handleUserStatusUpdate,
            data,
        ],
    )

    return <context.Provider value={value}>{children}</context.Provider>
}

export const usePermissionConfiguration = () => {
    const value = useContext(context)

    if (!value) {
        throw new Error('Please wrap with PermissionConfigurationFormProvider to use the hook')
    }

    return value
}
