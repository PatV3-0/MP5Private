// Response Interface
export interface Response{
    status: number,
    message: string,
    data: any
}

// Request Interface's 
export interface Request{
    action: string,
    payload?: any
}

export default {Response, Request}
