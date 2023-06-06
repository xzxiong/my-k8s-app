resources="./resources"
debug=$1
if [ "$debug" = "debug" ]; then
    set -x
    helm install --debug --dry-run mo-ruler-stack ${resources}/observability/charts/mo-ruler-stack -n mo-ob -f ./mo-ruler-unit.yaml
else
    set -x
    helm install  mo-ruler-stack ${resources}/observability/charts/mo-ruler-stack -n mo-ob -f ./mo-ruler-unit.yaml
fi
