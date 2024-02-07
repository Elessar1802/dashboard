import {
    BulkSelection,
    BulkSelectionEvents,
    Pagination,
    SortableTableHeaderCell,
} from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { toast } from 'react-toastify'
import { useAuthorizationBulkSelection } from '../../shared/components/BulkSelection'
import { PermissionGroup } from '../../types'
import { permissionGroupLoading, SortableKeys } from './constants'
import PermissionGroupRow from './PermissionGroupRow'
import { UserPermissionTableProps } from './types'

const PermissionGroupTable = ({
    isLoading,
    showPagination,
    isActionsDisabled,
    urlFilters,
    permissionGroups,
    refetchPermissionGroupList,
    totalCount,
}: UserPermissionTableProps) => {
    const { sortBy, sortOrder, handleSorting, offset, pageSize, changePage, changePageSize } = urlFilters
    const {
        handleBulkSelection,
        selectedIdentifiers: bulkSelectionState,
        getSelectedIdentifiersCount,
        isBulkSelectionApplied,
    } = useAuthorizationBulkSelection()
    const isSomeRowChecked = getSelectedIdentifiersCount() > 0

    const sortByName = () => {
        handleSorting(SortableKeys.name)
    }

    // TODO: Common Out
    const toggleCheckForBulkSelection = (id: PermissionGroup['id']) => {
        if (isBulkSelectionApplied) {
            handleBulkSelection({
                action: BulkSelectionEvents.CLEAR_IDENTIFIERS_AFTER_ACROSS_SELECTION,
                data: {
                    identifierIds: [id],
                },
            })
            toast.info('All previous selections have been cleared')
            return
        }

        handleBulkSelection(
            bulkSelectionState[id]
                ? {
                      action: BulkSelectionEvents.CLEAR_IDENTIFIERS,
                      data: {
                          identifierIds: [id],
                      },
                  }
                : {
                      action: BulkSelectionEvents.SELECT_IDENTIFIER,
                      data: {
                          identifierObject: {
                              ...bulkSelectionState,
                              [id]: true,
                          },
                      },
                  },
        )
    }

    return (
        <div className="flexbox-col flex-grow-1 show-shimmer-loading">
            <div className="user-permission__header cn-7 fs-12 fw-6 lh-20 dc__uppercase pl-20 pr-20 dc__border-bottom dc__position-sticky dc__top-0 bcn-0 dc__zi-1">
                {isLoading ? (
                    <span className="child child-shimmer-loading" />
                ) : (
                    <BulkSelection showPagination={showPagination} />
                )}
                <SortableTableHeaderCell
                    title="Name"
                    sortOrder={sortOrder}
                    isSorted={sortBy === SortableKeys.name}
                    triggerSorting={sortByName}
                    disabled={isActionsDisabled}
                />
                <span>Description</span>
                <span />
            </div>
            {isLoading ? (
                permissionGroupLoading.map((permissionGroup) => (
                    <div
                        className="user-permission__row pl-20 pr-20"
                        key={`permission-group-list-${permissionGroup.id}`}
                    >
                        <span className="child child-shimmer-loading" />
                        <span className="child child-shimmer-loading" />
                        <span className="child child-shimmer-loading" />
                    </div>
                ))
            ) : (
                <>
                    <div className="fs-13 fw-4 lh-20 cn-9 flex-grow-1">
                        {permissionGroups.map((permissionGroup, index) => (
                            <PermissionGroupRow
                                {...permissionGroup}
                                index={index}
                                key={`permission-group-${permissionGroup.id}`}
                                refetchPermissionGroupList={refetchPermissionGroupList}
                                isChecked={isBulkSelectionApplied || bulkSelectionState[permissionGroup.id]}
                                toggleChecked={toggleCheckForBulkSelection}
                                showCheckbox={isSomeRowChecked}
                            />
                        ))}
                    </div>
                    {showPagination && (
                        <Pagination
                            rootClassName="flex dc__content-space pl-20 pr-20 dc__border-top"
                            size={totalCount}
                            offset={offset}
                            pageSize={pageSize}
                            changePage={changePage}
                            changePageSize={changePageSize}
                        />
                    )}
                </>
            )}
        </div>
    )
}

export default PermissionGroupTable
