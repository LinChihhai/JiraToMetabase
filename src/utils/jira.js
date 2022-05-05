import getAllPaginatedData from './get-all-paginated-data.js';
import {getApi, query} from './fetch.js';

const api = getApi(process.env.JIRA_API)
const token = Buffer.from(`${process.env.JIRA_USER}:${process.env.JIRA_PASSWORD}`).toString('base64')

const auth = async(ctx, next) => {
	ctx.header('Authorization',`Basic ${token}`)
	return await next()
}

export const queryPaginatedIssues = jql => async (startAt, maxResult) => {
	const {issues,total} = await searchForIssuesUsingJqlGet({
		jql,
		startAt,
		maxResult
	})
	return {data: issues,total}
}
export const quertIssues = async (jql = '') => await getAllPaginatedData(queryPaginatedIssues(jql))

const fields = [
	'components',
	'creator',
	'assignee',
	'created',
	'duedate',
	'fixVersions',
	'issuelinks',
	'issuetype',
	'project',
	'resolution',
	'resolutiondate',
	'status',
	'timetracking',
	'summary',
	'labels',
	'priority',
	'reporter',
	process.env.JIRA_SCHEDULED_START_FIELD,
	process.env.JIRA_SCHEDULE_END_FIELD,
	process.env.JIRA_SPRINT_FIELD,
	process.env.JIRA_EPIC_FIELD,
	process.env.JIRA_REQ_BA_FIELD,
	process.env.JIRA_REQ_CHANGE_FIELD,
	process.env.JIRA_REQ_SPONSOR_DEPARTMENT_FIELD,
	process.env.JIRA_REQ_SPONSOR_FIELD,
	process.env.JIRA_REQ_OWNER_DEPARTMENT_FIELD,
	process.env.JIRA_REQ_CLASS,
	process.env.JIRA_REQ_CATEGORY,
	process.env.JIRA_BUG_SEVERITY_FIELD,
	process.env.JIRA_BUG_TEST_STAGE_FIELD,
	process.env.JIRA_BUG_TEST_ROUND_FIELD,
	process.env.JIRA_BUG_TYPE,
].join()

export const searchForIssuesUsingJqlGet = async ({jql, startAt = 0, maxResults = 50}) => {
	const response = await api(`api/2/search`, auth, query({jql, startAt, maxResults, expend: 'changelog', fields}))
	const {issues, total} = await response.json()
	return {issues, total}
}

export const getSprints = async project => {
	const response = await api(`greenhopper/1.0/integration/teamcalendars/sprint/list`, auth, query({jql: `project=${project}`}))

	const {sprints} = await response.json()
	return sprints
}

export const getRequirementStatuses = async() => {
	const response = await api(`api/2/status`, auth)
	return await response.json()
}

export const findUsersAssignableToProjects = async ({projectKeys = [], maxResults = 10000}) => {
	const response = await api(`api/2/user/assignable/multiProjectSearch`, auth, query({
		maxResults,
		projectKeys: projectKeys.join(',')
	}))	
	return await response.json()
}

export const getAllProjects = async() => {
	const response = await api(`api/2/project`, auth)
	return await response.json()
}

export const getProjectComponents = async projectIdOrKey => {
	const response = await api(`api/2/project/${projectIdOrKey}/components`, auth)
	return await response.json()
}

export const getProjectVersions = async projectIdOrKey => {
	const response = await api(`api/2/project/${projectIdOrKey}/versions`, auth)
	return await response.json()
}

export const queryGroups = async(maxResults = 0) => {
	const response = await api(`api/2/groups/picker`, auth, query({query: '', maxResults}))
	const {groups, total} = await response.json()
	return {total, groups}
}

const maskedGroups = process.env.JIRA_GROUPS_MASK.split('|')

export const getAllGroups = async () => {
	const {total} = await queryGroups(0)
	const {groups} = await queryGroups(total)
	return groups.map(({name}) => name).filter(name => maskedGroups.includes(name))
}

const queryUsersFromGroup = async (groupName, maxResults = 0) => {
	const response = await api(`api/2/group/member`, auth, query({
		groupname: groupName,
		maxResults,
		includeInactiveUsers: true,
	}))
	const {value, total} = await response.json()
	return {values, total}
}

export const getAllUsersFromGroup = async groupName => {
	const {total} = await queryUsersFromGroup(groupName, 0)
	const {values: users} = await queryUsersFromGroup(groupName, total)
	return users.map(({key}) => value)
}

export const getAllGroupUsers = async() => {
	const groups = await getAllGroups()
	const userGroupIndex = {}
	const groupUserIndex = {}
	for (const group of groups) {
		const users = await getAllUsersFromGroup(group)
		users.forEach(user => userGroupIndex[user] ??= group)
		groupUserIndex[group] ??= []
		groupUserIndex[group] = users.length
	}

	return {userGroupIndex, groupUserIndex}
}