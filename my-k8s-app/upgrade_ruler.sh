resources="./resources"
set -x
#helm install mo-agent-stack . -n mo-observability-agent -f /Users/jacksonxie/Downloads/Trash/eks_dev/observability/charts/mo-agent-stack/mo.yaml
#helm upgrade mo-agent-stack ./observability/charts/mo-agent-stack -n mo-observability-agent -f  observability/charts/mo-agent-stack/mo.yaml
#helm upgrade mo-agent-stack ./observability/charts/mo-agent-stack -n mo-observability-agent -f ./mo-agent-eks.yaml
helm upgrade mo-ruler-stack $resources/observability/charts/mo-ruler-stack -n mo-ob -f ./mo-ruler-unit.yaml
