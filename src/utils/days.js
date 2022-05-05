import dayjs from "dayjs";

export const today = () => dayjs().format('YYYY-MM-DD')
export const yesterday = () => dayjs().substract(1, 'day').format('YYYY-MM-DD')
export const toDate = o => o ? dayjs(o).toDate() : o