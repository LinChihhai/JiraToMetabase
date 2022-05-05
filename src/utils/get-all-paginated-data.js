export default async extract => {
    const {total} = await extract(0, 0)
    const maxResults = 50
    const result = []
    
    for (let startAt = 0; startAt < total; startAt += maxResults) {
        const {data} = await extract(startAt, maxResults)
        result.push(...data)
    }

    return result
}