import { AccessControlDashboard } from "@/components/AccessControlDashboard";
import RobotControRoom from "@/components/RobotRoom";
import { Auth, getLatestAlerts, getServerReturnUrl, getUserRobot } from "@/lib/serverq";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { robotId: string } }) {
  const refree = await getServerReturnUrl();
  const robotId = Number(params.robotId);
  if (Number.isNaN(robotId)) redirect(refree);

  const session = await Auth();
  if (!session) return;

  const robot = await getUserRobot(session.user.id, robotId);
  if (!robot) redirect(refree);

  const modelType = robot.modelRelation.modelType?.toLowerCase() ?? "";
  const isAccessControl = modelType.includes("access control");

  if (isAccessControl) {
    const alerts = await getLatestAlerts();
    return <AccessControlDashboard robot={robot} alerts={alerts} />;
  }

  return <RobotControRoom intialRobot={robot} />;
}
