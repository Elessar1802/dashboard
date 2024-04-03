import React, { Fragment, useEffect, useRef, useState } from 'react'
import { NavLink, useHistory } from 'react-router-dom'
import { withShortcut, IWithShortcut } from 'react-keybind'
import moment from 'moment'
import { stopPropagation, ConditionalWrap } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import ReactSelect, { components, GroupBase, InputActionMeta, OptionProps } from 'react-select'
import Select from 'react-select/dist/declarations/src/Select'
import { ReactComponent as Cross } from '../../../assets/icons/ic-cross.svg'
import { ReactComponent as SearchIcon } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as ClearIcon } from '../../../assets/icons/ic-error.svg'
import { ReactComponent as RefreshIcon } from '../../../assets/icons/ic-arrow-clockwise.svg'
import { getCustomOptionSelectionStyle } from '../../v2/common/ReactSelect.utils'
import { COMMON_TABS_SELECT_STYLES, EMPTY_TABS_DATA, initTabsData, checkIfDataIsStale } from './Utils'
import { DynamicTabsProps, DynamicTabType, TabsDataType } from './Types'
import { MoreButtonWrapper, noMatchingTabs, TabsMenu, timerTransition } from './DynamicTabs.component'
import { AppDetailsTabs } from '../../v2/appDetails/appDetails.store'
import Timer from './DynamicTabs.timer'
import './DynamicTabs.scss'

/**
 * This component enables a way to display dynamic tabs with the following functionalities,
 * - Can make certain tabs fixed
 * - Takes the parent's width as init reference to identify stop width
 * - Shows more options CTA when there's no available width to display all tabs
 * - Scrollable tabs section by default
 *
 * Note: To be used with useTabs hook
 */
const DynamicTabs = ({
    tabs,
    removeTabByIdentifier,
    markTabActiveById,
    stopTabByIdentifier,
    enableShortCut,
    shortcut,
    refreshData,
    /* NOTE: shouldn't this be named showTimer or hideTimer? */
    isOverview,
    setIsDataStale,
}: DynamicTabsProps & IWithShortcut) => {
    const { push } = useHistory()
    const tabsSectionRef = useRef<HTMLDivElement>(null)
    const fixedContainerRef = useRef<HTMLDivElement>(null)
    const dynamicWrapperRef = useRef<HTMLUListElement>(null)
    const moreButtonRef = useRef<Select<DynamicTabType, false, GroupBase<DynamicTabType>>>(null)
    const tabRef = useRef<HTMLAnchorElement>(null)
    const [tabsData, setTabsData] = useState<TabsDataType>(EMPTY_TABS_DATA)
    const [selectedTab, setSelectedTab] = useState<DynamicTabType>(null)
    const [tabSearchText, setTabSearchText] = useState('')
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const tabPopupMenuRef = useRef(null)
    const CLUSTER_TERMINAL_TAB = 'cluster_terminal-Terminal'

    useEffect(() => {
        initTabsData(tabs, setTabsData, setSelectedTab, closeMenu)
    }, [tabs])

    const updateRef = (_node: HTMLAnchorElement) => {
        if (_node?.dataset?.selected === 'true' && _node !== tabRef.current) {
            _node.focus()
            tabRef.current = _node
        }
    }

    const getTabNavLink = (tab: DynamicTabType, isFixed: boolean) => {
        const { name, url, isDeleted, isSelected, iconPath, dynamicTitle, showNameOnSelect, isAlive } = tab

        return (
            <NavLink
                to={url}
                ref={updateRef}
                className={`dynamic-tab__resource cursor cn-9 dc__no-decor dc__outline-none-imp dc__ellipsis-right pl-12 pt-8 pb-8 ${
                    isFixed ? 'pr-12' : 'pr-8'
                } w-100`}
                data-selected={isSelected}
            >
                <div
                    className={`flex left ${isSelected ? 'cn-9' : ''} ${isDeleted ? 'dynamic-tab__deleted cr-5' : ''}`}
                >
                    {iconPath && <img className="icon-dim-16" src={iconPath} alt={name} />}
                    {(!showNameOnSelect || isAlive || isSelected) && (
                        <span
                            className={`fs-12 fw-6 lh-20 dc__ellipsis-right ${iconPath ? 'ml-8' : ''} `}
                            data-testid={name}
                        >
                            {dynamicTitle || name}
                        </span>
                    )}
                </div>
            </NavLink>
        )
    }

    const handleTabCloseAction = (e) => {
        e.stopPropagation()
        const pushURLPromise = removeTabByIdentifier(e.currentTarget.dataset.id)
        pushURLPromise.then((url) => url && push(url))
    }

    const handleTabStopAction = (e) => {
        e.stopPropagation()
        const pushURLPromise = stopTabByIdentifier(e.currentTarget.dataset.id)
        pushURLPromise.then((url) => url && push(url))
    }

    const getTabTippyContent = (title: string) => {
        const _titleSplit = title.split('/')

        return (
            <div className="w-100">
                <h2 className="fs-12 fw-6 lh-18 m-0 dc__word-break">{_titleSplit[0]}</h2>
                {_titleSplit[1] && <p className="fs-12 fw-4 lh-18 mt-4 mb-0 dc__word-break">{_titleSplit[1]}</p>}
            </div>
        )
    }

    const markTabActiveOnClickFactory = (tab: DynamicTabType) => () => markTabActiveById(tab.id)

    const renderTab = (tab: DynamicTabType, idx: number, isFixed?: boolean) => {
        const _showNameOnSelect = tab.showNameOnSelect && tab.isAlive

        return (
            <Fragment key={`${idx}-tab`}>
                <div className={!tab.isSelected ? 'dynamic-tab__border' : ''} />
                <button
                    id={tab.name}
                    className={`${isFixed ? 'fixed-tab' : 'dynamic-tab'}  flex left flex-grow-1 ${
                        tab.isSelected ? 'dynamic-tab__item-selected' : ''
                    }`}
                    onClick={markTabActiveOnClickFactory(tab)}
                >
                    <ConditionalWrap
                        condition={!isFixed}
                        wrap={(children) => (
                            <Tippy
                                className="default-tt dc__mxw-300 dc__mnw-100"
                                arrow={false}
                                placement="top"
                                duration={[600, 0]}
                                moveTransition="transform 0.1s ease-out"
                                content={getTabTippyContent(tab.title)}
                            >
                                {children}
                            </Tippy>
                        )}
                    >
                        <div className="flex w-100">
                            <div
                                className={`w-100 ${
                                    tab.isSelected ? 'dynamic-tab-selected bcn-0 cn-9' : ''
                                } flex left ${isFixed && !_showNameOnSelect ? '' : 'pr-12'} h-36`}
                            >
                                {getTabNavLink(tab, isFixed)}
                                {_showNameOnSelect && (
                                    <div
                                        className="dynamic-tab__close icon-dim-16 flex br-5 ml-auto"
                                        data-id={tab.id}
                                        onClick={handleTabStopAction}
                                    >
                                        <Cross className="icon-dim-16 cursor p-2 fcn-6 scn-6" />
                                    </div>
                                )}
                                {!isFixed && (
                                    <div
                                        className="dynamic-tab__close icon-dim-16 flex br-5 ml-auto"
                                        data-id={tab.id}
                                        onClick={handleTabCloseAction}
                                    >
                                        <Cross className="icon-dim-16 cursor p-2 fcn-6 scn-6" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </ConditionalWrap>
                </button>
            </Fragment>
        )
    }

    const highLightText = (highlighted) => `<mark>${highlighted}</mark>`

    const tabsOption = (props: OptionProps<any, false, any>) => {
        const { selectProps, data } = props
        selectProps.styles.option = getCustomOptionSelectionStyle({
            display: 'flex',
            alignItems: 'center',
        })

        const splittedLabel = data.label.split('/')
        const regex = new RegExp(tabSearchText, 'gi')

        return (
            <div onClick={stopPropagation}>
                <components.Option {...props}>
                    <div className="tab-option__select dc__highlight-text">
                        <small
                            className="cn-7"
                            dangerouslySetInnerHTML={{
                                __html: splittedLabel[0].replace(regex, highLightText),
                            }}
                        />
                        {splittedLabel[1] && (
                            <div
                                className="w-100 dc__ellipsis-right"
                                dangerouslySetInnerHTML={{
                                    __html: splittedLabel[1].replace(regex, highLightText),
                                }}
                            />
                        )}
                    </div>
                    <div
                        className="dynamic-tab__close icon-dim-20 flex br-5 ml-8"
                        data-id={data.id}
                        onClick={handleTabCloseAction}
                    >
                        <Cross className="icon-dim-16 cursor p-2 fcn-6 scn-6" />
                    </div>
                </components.Option>
            </div>
        )
    }

    const handleOnChangeSearchText = (newValue: string, actionMeta: InputActionMeta) => {
        if ((actionMeta.action === 'input-blur' || actionMeta.action === 'menu-close') && actionMeta.prevInputValue) {
            setTabSearchText(actionMeta.prevInputValue)
        } else {
            setTabSearchText(newValue)
        }
    }

    const focusSearchTabInput = () => {
        moreButtonRef.current?.inputRef?.focus()
    }

    const clearSearchInput = () => {
        setTabSearchText('')
        focusSearchTabInput()
    }

    const onChangeTab = (option: DynamicTabType): void => {
        if (option) {
            setSelectedTab(option)
            setIsMenuOpen(false)
            push(option.url)
        }
    }

    const toggleMenu = () => {
        setIsMenuOpen((isOpen) => !isOpen)
        setTabSearchText('')
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
        setTabSearchText('')
    }

    const escHandler = (e: any) => {
        if (e.keyCode === 27 || e.key === 'Escape') {
            closeMenu()
        }
    }

    const updateOnStaleData = (now: moment.Moment) => {
        if (!now || !checkIfDataIsStale(selectedTab.lastSyncMoment, now)) {
            return
        }
        setIsDataStale(true)
    }

    const timerTranspose = (output: string) => {
        return (
            <>
                <Tippy className="default-tt" arrow={false} placement="top" content="Sync Now">
                    <div>
                        <RefreshIcon
                            data-testid="refresh-icon"
                            className="icon-dim-16 scn-6 flexbox mr-6 cursor ml-12"
                            onClick={refreshData}
                        />
                    </div>
                </Tippy>
                {selectedTab?.name === AppDetailsTabs.k8s_Resources && (
                    <div className="flex">
                        {output}
                        <span className="ml-2">ago</span>
                    </div>
                )}
            </>
        )
    }

    const timerForSync = () => {
        return (
            selectedTab && <Timer
                start={selectedTab.lastSyncMoment}
                callback={updateOnStaleData}
                transition={timerTransition}
                transpose={timerTranspose}
            />
        )
    }

    return (
        <div ref={tabsSectionRef} className="dynamic-tabs-section flex left pl-12 pr-12 w-100 dc__outline-none-imp">
            {tabsData.fixedTabs.length > 0 && (
                <div ref={fixedContainerRef} className="fixed-tabs-container">
                    <ul className="fixed-tabs-wrapper flex left p-0 m-0">
                        {tabsData.fixedTabs.map((tab, idx) => renderTab(tab, idx, true))}
                    </ul>
                </div>
            )}
            {tabsData.dynamicTabs.length > 0 && (
                <div className={`dynamic-tabs-container ${tabsData.dynamicTabs[0].isSelected ? '' : 'dc__border-left'}`}>
                    <ul ref={dynamicWrapperRef} className="dynamic-tabs-wrapper flex left p-0 m-0">
                        {tabsData.dynamicTabs.map((tab, idx) => renderTab(tab, idx))}
                    </ul>
                </div>
            )}
            {(tabsData.dynamicTabs.length > 0 || (!isOverview && selectedTab?.id !== CLUSTER_TERMINAL_TAB)) && (
                <div className="ml-auto flexbox dc__no-shrink dc__align-self-stretch dc__border-left">
                    {!isOverview && selectedTab?.id !== CLUSTER_TERMINAL_TAB && (
                        <div className="flexbox fw-6 cn-7 dc__align-items-center">{timerForSync()}</div>
                    )}

                    {tabsData.dynamicTabs.length > 0 && (
                        <MoreButtonWrapper
                            tabPopupMenuRef={tabPopupMenuRef}
                            isMenuOpen={isMenuOpen}
                            onClose={closeMenu}
                            toggleMenu={toggleMenu}
                        >
                            <div
                                className="more-tabs__search-icon icon-dim-16 cursor-text"
                                onClick={focusSearchTabInput}
                            >
                                <SearchIcon className="icon-dim-16" />
                            </div>
                            <ReactSelect
                                ref={moreButtonRef}
                                placeholder="Search tabs"
                                classNamePrefix="tab-search-select"
                                options={tabsData.dynamicTabs}
                                value={selectedTab}
                                inputValue={tabSearchText}
                                onChange={onChangeTab}
                                onKeyDown={escHandler}
                                onInputChange={handleOnChangeSearchText}
                                tabSelectsValue={false}
                                backspaceRemovesValue={false}
                                controlShouldRenderValue={false}
                                hideSelectedOptions={false}
                                menuIsOpen
                                autoFocus
                                noOptionsMessage={noMatchingTabs}
                                components={{
                                    IndicatorSeparator: null,
                                    DropdownIndicator: null,
                                    Option: tabsOption,
                                    Menu: TabsMenu,
                                }}
                                styles={COMMON_TABS_SELECT_STYLES}
                            />
                            <div className="more-tabs__clear-tab-search icon-dim-16 cursor">
                                {tabSearchText && (
                                    <ClearIcon
                                        className="clear-tab-search-icon icon-dim-16"
                                        onClick={clearSearchInput}
                                    />
                                )}
                            </div>
                        </MoreButtonWrapper>
                    )}
                </div>
            )}
        </div>
    )
}

export default withShortcut(DynamicTabs)
