import {
  getProposals,
  getProducersList,
  getVotes,
  getBPResponses
} from "../controllers/controller";

export function routes(app) {
  app.route("/api/proposals").get(getProposals);
  app.route("/api/producers").get(getProducersList);
  app.route("/api/votes").post(getVotes);
  app.route("/api/responses").post(getBPResponses);
}
