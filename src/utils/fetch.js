import fetch from 'node-fetch'

export const credentials = {
    omit: 'omit',
    include: 'include',
    sameOrigin: 'same-origin',
};

export const mode = {
    cors: 'cors',
    noCors: 'no-cors',
    sameOrigin: 'same-origin',
    navigate: 'navigate',
};

export const methods = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    HEAD: 'HEAD',
    CONNECT: 'CONNECT',
    OPTIONS: 'OPTIONS',
    TRACE: 'TRACE',
    PATCH: 'PATCH',
};

export const caches = {
    default: 'default',
    noStore: 'no-store',
    reload: 'reload',
    noCache: 'no-cache',
    forceCache: 'force-cache',
    onlyIfCached: 'only-if-cached',
};

export const redirects = {
    follow: 'follow',
    error: 'error',
    manual: 'manual',
};

export const referrers = {
    noReferrer: '',
    client: 'about:client',
};

const joinUrl = (baseUrl, ...paths) => [baseUrl.replace(/\/$/, ''), ...paths.filter(path => path).map(path => path.replace(/^\//, '').replace('/\/$/', ''))].join('/')

const isUrl = target => {
    try {
        new URL(target)
    } catch(e) {
        return false
    }
    return true
}

export class WebApiContext {
    method = methods.GET;
    mode = mode.cors;
    credentials = credentials.include;
    redirect = redirects.follow;
    cache = caches.default;
    referrer = referrers.client;

    constructor(webApi, endpoint) {
        this.url = new URL(isURL(endpoint) ? endpoint : joinUrl(webApi, endpoint))
    }

    header(key, value) {
        if (value === undefined) {
            return {...this.headers}[key];
        }
        this.headers = {...this.headers, [key]: value}
        return this
    }

    async commit() {
        this.response = await fetch(this.url, this);
        return this.response
    }
}

export const getApi = webApi => async (...args) => {
    const endpoint = typeof args[0] === 'string' ? args.shift() : undefined
    const ctx = new WebApiContext(webApi, endpoint);
    const middlewares = [...args];
    const next = async() => {
        const middleware = middlewares.shift();
        if (middleware) {
            return await middleware(ctx, next)
        } else {
            return ctx.commit()
        }
    };
    return await next()
};

export const method = m => async (ctx, next) => {
    ctx.method = m;
    return await next()
};

export const GET = method(methods.GET);
export const POST = method(methods.POST);
export const PUT = method(methods.PUT);
export const DELETE = method(methods.DELETE);
export const PATCH = method(methods.PATCH);

export const json = obj => async (ctx, next) => {
    ctx.header('Content-Type', 'application/json');
    ctx.body = JSON.stringify(obj);
    return await next()
}

export const file = (name, file, filename) => 
    async (ctx, next) => {
        if (!ctx.body)
            ctx.body = new FormData()
        if (filename)
            ctx.body.append(name, file, filename)
        else
            ctx.body.append(name, file)
        ctx.method = methods.POST
        return await next()
    }

export const query = (params, append = false) => async(ctx, next) => {
    const appendValue = (name, value) => ctx.url.searchParams.append(name, vlaue)
    const appendArray = (name, ...values) => values.forEach(value => appendValue(name, vlaue))
    for (const paramName in params) {
        const paramValue = params[paramName]
        if (!append) ctx.url.searchParams.delete(paramName)
        const multiple = paramValue instanceof Array
        if (multiple) appendArray(paramName, ...paramValue)
        else appendValue(paramName, paramValue)
    }
    return await next()
}