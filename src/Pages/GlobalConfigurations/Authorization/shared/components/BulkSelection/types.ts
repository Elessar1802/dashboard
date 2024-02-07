import { UseUrlFiltersReturnType } from '@devtron-labs/devtron-fe-common-lib'
import { MutableRefObject } from 'react'
import { PermissionGroup, User } from '../../../types'
import { BulkSelectionModalTypes } from './constants'

export type BulkSelectionState = Record<User['id'] | PermissionGroup['id'], boolean>

export type BulkSelectionModalConfig = {
    type: BulkSelectionModalTypes
    onSuccess?: () => void
    onCancel?: () => void
} | null

export interface BulkSelectionActionWidgetProps {
    parentRef: MutableRefObject<HTMLDivElement>
    count: number
    areActionsDisabled: boolean
    // TODO (v2): Something better
    filterConfig: {
        searchKey: string
    }
    selectedIdentifiersCount: number
    isCountApproximate?: boolean
    setBulkSelectionModalConfig: (config: BulkSelectionModalConfig) => void
    refetchList: () => void
    showStatus: boolean
}

export interface BulkSelectionModalProps
    extends BulkSelectionModalConfig,
        Pick<
            BulkSelectionActionWidgetProps,
            'refetchList' | 'setBulkSelectionModalConfig' | 'selectedIdentifiersCount'
        > {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    urlFilters: UseUrlFiltersReturnType<any>
}

export interface BulkSelectionClearConfirmationModalProps {
    type: BulkSelectionModalTypes.clearAllAcrossPages | BulkSelectionModalTypes.selectAllAcrossPages
    onClose: () => void
    onSubmit: () => void
}

export interface BulkDeleteModalProps
    extends Pick<BulkSelectionModalProps, 'refetchList' | 'urlFilters'>,
        Pick<BulkSelectionActionWidgetProps, 'selectedIdentifiersCount'> {
    onClose: () => void
}
