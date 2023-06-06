kubectl get secret -n mo-ob grafana-admin-secret -o yaml | grep password | while read _1 pw; do echo $pw | base64 -d ; done
echo
