import getAllPaginatedData from './get-all-paginated-data.js';
import {getApi,query} from './fetch.js';

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
]