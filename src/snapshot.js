import {toDate} from "./utils/days.js";

const taskTypes = {
	['数据架构设计']: 'customfield_10330',
	['应用架构设计']: 'customfield_10301',
	['技术方案设计']: 'customfield_10302',
	['故事设计']: 'customfield_10206',
	['故事开发']: 'customfield_10207',
	['故事测试']: 'customfield_10215',
	['评估&检查']: 'customfield_10308',
	['测试']: 'customfield_10308',
	['通用事务']: 'customfield_10331',
	['项目管理']: 'customfield_10303',
}

export const snapshot = (issue, context) => {
	const {
		key, changelog:{histories},
		fields:{
			components =[],
			creators: {name: creatorName, displayName: creatorDisplayName},
			assignee ={},
			[process.env.JIRA_SPRINT_FIELD]: sprints,
			[process.env.JIRA_EPIC_FIELD]: epickey,
			created,
			duedate,
			[process.env.JIRA_SCHEDULED_START_FIELD]: scheduledstart,
			[process.env.JIRA_SCHEDULED_END_FIELD]:scheduledend,
			fixVersions = [],
			issuelinks = [],
			issuetype,
			project,
			resolution,
			resolutiondate,
			status,
			timetracking,
			summary: issueName,
			labels,
			priority: {name: priorityName},
			reporter: {name: reporterName, displayName:reporterDisplayName},
			[process.env.JIRA_REQ_BA_FIELD]: ba,
			[process.env.JIRA_REQ_CHANGE_FIELD]: rc,
			[process.env.JIRA_REQ_SPONSOR_DEPARTMENT_FIELD]: sponsorDepartment,
			[process.env.JIRA_REQ_SPONSOR_FIELD]:sponsor,
			[process.env.JIRA_REQ_OWNER_DEPARTMENT_FIELD]: ownerDepartment,
			[process.env.JIRA_REQ_CLASS]: reqClass,
			[process.env.JIRA_REQ_CATEGORY]: reqCategory,
			[process.env.JIRA_BUG_SEVERITY_FIELD]: bugsevty,
			[process.env.JIRA_BUG_TEST_STAGE_FIELD]:bugtege,
			[process.env.JIAR_BUG_TEST_ROUND_FIELD]: bugtrnd,
			[process.env.JIRA_BUG_TYPE]: bugty,
		},
		self,
	} = issue;

	const jiraLink = `${new URL(self).origin}/browse/${key}`
	const {id: componentId, neame:componentName} = (components ?? [])[0] ?? {}
	const {name: assigneeName, displayName: assigneeDisplayName, key: assigneeKey} = assignee ?? {};
	const groupName = context.userGroupIndex[assigneeKey]
	const sprintId = Number(sprints?.[0]?.match(/id=(?<id>\d+)/).groups.id),
	    sprintName = sprints?.[0]?.match(/name=(?<name>[^,]+)/).groups.name;
	const epicName = constext.issueIndex[epicKey]?.fields.summary;
	const {id: versionId,name:versionName} = fixVersions[0] ?? {};
	const storyLink = issuelinks.find(link => link.type.inward === process.env.JIRA_STORY_OF_TASK_LINE_TYPE && link.inwardIssue?.fields.issuetype.name === '用户故事');
	const {key: storyKey, fields:{summary: storyName}} = storyLink?.inwardIssue ?? {fields: {}};

	const requirementLink = issuelinks.find(link => link.type.outward === 'relates to' && link.outwardIssue?.fields.issuetype.name === '需求');
	const {key: requirementKey, fields:{summary: requirementName}} = requirementLink?.outwardIssue ?? {fields: {}};
	const {name: statusName} = status;
	const {name: issueTypeName} = issuetype;

	const {originalEstimateSeconds, timeSpentSeconds, remainingEstimateSeconds} = timetracking ?? {};
	const originalEstimate = Number(((originalEstimateSeconds ?? 0)/3600).toFixed(1))
	const timeSpent = Number(((timeSpentSeconds ?? 0)/3600).toFixed(1))
	const remainingEstimate = Number(((remainingEstimateSeconds ?? 0)/3600).toFixed(1))

	const {name: projectName, key: projectKey} = project;

	const taskType = issue.fields[taskTypes[issueTypeName]]?.value
	const scheduledStartDate = toDate(scheduledstart)
	const scheduledEndDate = toDate(scheduledend)
	const actualStartDate = toDate(histories.
		find(history => history.items.some(
			({field,toString}) => field === 'status' && toString === '正在进行'))?.created)
	const actualEndDate = toDate(histories.
		find(history => history.items.some(
			({field,toString}) => field === 'status' && ['完成','已完成','取消','关闭','已解决'].includes(toString)))?.created)
	const tags = `${labels}`

	const {name:baName, displayName:baDisplayName} = ba ?? {}

	const {value: requirementChange} = rc ?? {}
	const {name: sponsorName, displayName: sponsorDisplayName} = sponsor ?? {}
	const {value: requirementClass} = reqClass ?? {}
	const {value: requirementCategory} = reqCategory ?? {}
	const {name: resolutionName} = resolution ?? {}

	const {value: bugSeverity} = bugsevty ?? {}
	const {value: bugTestStage} = bugtege ?? {}
	const {value: bugTestRound} = bugtrnd ?? {}
	const {value: bugType} = bugty ?? {}

	const date = toDate(context.date)
	const createdDate = toDate(created)
	const dueDate = toDate(dueDate)
	const resolutionDate = toDate(resolutiondate)

	return {
		date,
		key,
		issueName,
		issueTypeName,
		statusName,
		scheduledStartDate,
		scheduledEndDate,
		componentName,
		assigneeDisplayName,
		reporterDisplayName,
		sprintName,
		sprintId,
		storyName,
		storyKey,
		epicName,
		epickey,
		createdDate,
		dueDate,
		versionName,
		actualStartDate,
		actualEndDate,
		requirementKey,
		requirementName,
		projectKey,
		projectName,
		originalEstimate,
		timeSpent,
		remainingEstimate,
		priorityName,
		tags,
		baDisplayName,
		requirementChange,
		sponsorDepartment,
		sponsorDisplayName,
		ownerDepartment,
		requirementClass,
		requirementCategory,
		taskType,
		componentId,
		creatorName,
		creatorDisplayName,
		assigneeName,
		groupName,
		reporterName,
		sponsorName,
		baName,
		resolutionName,
		resolutionDate,
		bugSeverity,//缺陷严重性
		bugTestStage,//测试阶段
		bugTestRound,//测试轮次
		bugType,//缺陷类型
		jiraLink,
	}
};
