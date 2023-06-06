set -x
#helm install mo-agent-stack . -n mo-observability-agent -f /Users/jacksonxie/Downloads/Trash/eks_dev/observability/charts/mo-agent-stack/mo.yaml
resources="./resources"
debug=$1
if [ "$debug" = "debug" ]; then
    set -x
    extra_args="--debug --dry-run"
fi
set -x
helm install $extra_args mo-agent-stack $resources/observability/charts/mo-agent-stack -n mo-ob -f ./mo-agent-unit.yaml
