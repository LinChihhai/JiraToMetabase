export PATH=/opt/jira/env/node-v17.2.0-linux-x64/bin:$PATH

node -v
npx -v

nohup npm run start > nohup.out 2>&1 &

if [[ $? -eq 0 ]]; then
  echo $! > monitor.pid
else
  exit 1
fi