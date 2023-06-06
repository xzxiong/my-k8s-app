kubectl get secret -n mo-ob mo-ob-secret -o yaml | grep host | while read _1 pw; do echo $pw | base64 -d ; done
echo
kubectl get secret -n mo-ob mo-ob-secret -o yaml | grep port | while read _1 pw; do echo $pw | base64 -d ; done
echo
kubectl get secret -n mo-ob mo-ob-secret -o yaml | grep user | while read _1 pw; do echo $pw | base64 -d ; done
echo
kubectl get secret -n mo-ob mo-ob-secret -o yaml | grep password | while read _1 pw; do echo $pw | base64 -d ; done
echo
