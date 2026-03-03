import { AccessControlDashboard } from "@/components/AccessControlDashboard";
import RobotControRoom from "@/components/RobotRoom";
import {
  Auth,
  getLatestAlerts,
  getServerReturnUrl,
  getUserRobot,
} from "@/lib/serverq";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ robotId: string }>;
}) {
  const refree = await getServerReturnUrl();
  const { robotId: rowRobotId } = await params;
  const robotId = Number(rowRobotId);
  if (Number.isNaN(robotId)) redirect(refree);

  const session = await Auth();
  if (!session) return;

  const robot = await getUserRobot(session.user.id, robotId);
  if (!robot) redirect(refree);

  const modelType = robot.modelRelation.modelType?.toLowerCase() ?? "";
  const isAccessControl = modelType
    .toLocaleLowerCase()
    .includes("access control");

  if (isAccessControl) {
    return <AccessControlDashboard robot={robot} />;
  }

  return <RobotControRoom intialRobot={robot} />;
}
