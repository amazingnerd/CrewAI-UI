import prisma from "@/utils/prisma";

const nodecallspython = require("node-calls-python");

const py = nodecallspython.interpreter;

py.addImportPath(process.env.PYTHON_SITE_PACKAGES);

export function runMission(id) {
  const crewaiPath = process.env.CREW_AI_PY_FILE;
  return py
    .import(crewaiPath)
    .then(async function (pymodule) {
      const mission = await prisma.mission.findFirst({
        where: { id },
        include: { crew: true },
      });
      if (mission) {
        const result = await py.call(pymodule, "run_mission", mission);
        const missionWithResult = prisma.mission.update({
          where: { id },
          data: { result },
        });
        return missionWithResult;
      } else {
        throw Error("Mission doest not exist");
      }
    })
    .catch((err) => console.log(err));
}
