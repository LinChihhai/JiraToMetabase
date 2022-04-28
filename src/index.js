import './utils/env.js';
import {start} from './web/server.js';
import {toDate} from './utils/days.js';
import {today} from './utils/days.js';
import {CronJob} from 'cron';
import {defaultLogProvider} from './utils/logger.js';
import {getAllGroupUsers, getAllProjects, queryIssues} from './utils/jira.js';
import mongo from './utils/mongo.js';
import {snapshot} from './snapshot.js';

await start()

const runJobs = async () => {
	const logger = defaultLogProvider('run-jobs')
	// const date = today()

	logger.info('loading groups & users...')
	const {groupUserIndex, userGroupIndex} = await getAllGroupUsers()
	logger.info('Loaded groups & users')

	const context = {
		date: today(),
		userGroupIndex,
	}

	logger.info('Saving issues snapshot...')
	await mongo(async db =>{
		const collection = db.collection('issues-snapshots');
		await collection.deleteMany({"date":toDate(context.date)})
		collection.insertMany(issues.map(issue => snapshot(issue,context)));
	})
	logger.info('Saved issues snapshot.')
}

new CronJob(process.env.CRON, runJobs, null, true, 'Asia/Hongkong', null, true)