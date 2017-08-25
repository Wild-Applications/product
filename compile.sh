docker build -t wildapps/product:0.0.1 . &&
kubectl scale --replicas=0 deployment deployment --namespace=product &&
kubectl scale --replicas=2 deployment deployment --namespace=product
