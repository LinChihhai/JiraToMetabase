pkill -g $(ps -o "pgid=" $(cat monitor.pid))

if [[ $? -eq 0 ]]; then
  rm -rf monitor.pid
else
  exit 1
fi