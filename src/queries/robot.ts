import { getLatestAlerts } from "@/lib/serverq"
import {queryOptions} from "@tanstack/react-query"

export const alertsQuery = (domain:string)=>{
  return queryOptions({
    queryKey:["alerts",domain],
    queryFn:async ()=> await getLatestAlerts(domain),
    
  })
}