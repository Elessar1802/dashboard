/*
 *   Copyright (c) 2024 Devtron Inc.
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React from 'react'
import { GitProvider, GitProviderTabIconsProps } from './gitops.type'
import { ReactComponent as Bitbucket } from '../../assets/icons/git/bitbucket.svg'
import { ReactComponent as ICAwsCodeCommit } from '../../assets/icons/ic-aws-codecommit.svg'
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg'
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg'
import { ReactComponent as Azure } from '../../assets/icons/ic-azure.svg'
import { ReactComponent as ICGit } from '../../assets/icons/git/git.svg'

const GitProviderTabIcons = ({ provider, rootClassName }: GitProviderTabIconsProps) => {
    switch (provider) {
        case GitProvider.GITHUB:
            return <GitHub className={`${rootClassName || ''} dc__no-shrink`} />
        case GitProvider.GITLAB:
            return <GitLab className={`${rootClassName || ''} dc__no-shrink`} />
        case GitProvider.AZURE_DEVOPS:
            return <Azure className={`${rootClassName || ''} dc__no-shrink`} />
        case GitProvider.BITBUCKET_CLOUD:
            return <Bitbucket className={`${rootClassName || ''} dc__no-shrink`} />
        case GitProvider.AWS_CODE_COMMIT:
            return <ICAwsCodeCommit className={`${rootClassName || ''} dc__no-shrink`} />
        default:
            return <ICGit className={`${rootClassName || ''} dc__no-shrink`} />
    }
}

export default GitProviderTabIcons
