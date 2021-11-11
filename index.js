const core = require("@actions/core");
const github = require("@actions/github");
const fetch = require('node-fetch');

try {
  const status = core.getInput("job-status");
  const serviceName = core.getInput("service-name");
  const envName = core.getInput("env-name");
  const jobName = github.context.job;
  
  let branch = github.context.ref.split("/").splice(-1)[0];
  let workflow = github.context.workflow.split("/").splice(-1)[0].replace(".yml", "");
  let eventInfo = core.getInput("event");

//   let content;
//   switch (github.context.eventName) {
//     case "push":
//       content = `Push on *${branch}*. Job: ${jobName} \n Commit: ${JSON.parse(eventInfo).head_commit.url}`; 
//       break;
//     case "pull_request":
//       content = `Pull Request #${github.context.payload.pull_request.number}: ${github.context.payload.pull_request.html_url}`;
//       break;
//     default:
//       content = `On *${branch}* branch \n Commit: ${JSON.parse(eventInfo).head_commit.url}`;
//   };
  
  const payload = {
    channel: `${core.getInput("channel")}`,
    attachments: [
      {
        color: status === "started" ? "#2e993e" : status === "ended" ? "#2e993e" : "#d29d0c",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Github Action *${workflow}*: *${status === "started" ?`Started deployment for ${serviceName} in ${envName} environment` : status === "ended" ? `Deployment successful for ${serviceName} in ${envName} environment` : "CANCELLED"}*`
            }
          },    
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Run details: <https://github.com/Grit-Financial/${github.context.repo.repo}/actions/runs/${github.context.runId} | ${github.context.runId} run details>` 
//               \n${content}`
            }
          },
          {
            type: "context",
            elements: [
              {
                type: "image",
                image_url: `https://github.com/${github.context.actor}.png`,
                alt_text: "images"
              },
              {
                type: "mrkdwn",
                text: `*Author:* ${github.context.actor}`
              }
            ]
          },
          {
            type: "context",
            elements: [
              {
                type: "image",
                image_url: "https://avatars0.githubusercontent.com/u/9919?s=280&v=4",
                alt_text: "images"
              },
              {
                type: "mrkdwn",
                text: `<https://github.com/Grit-Financial/${github.context.repo.repo}| Grit-Financial/${github.context.repo.repo}>`
              }
            ]
          }
        ],
      },
    ],
  };

  fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": payload.length,
      Authorization: `Bearer ${core.getInput("slack-bot-token")}`,
      Accept: "application/json",
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Server error ${res.status}`);
      }

      return res.json();
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Slack error ${res.error}`);
      }
    });

} catch (error) {
  core.setFailed(error.message);
}
