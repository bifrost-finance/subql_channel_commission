REPO=harbor.liebi.com/commission
BUILD_VERSION   := $(shell git log -1 --pretty='%h')
NAMESPACE := commission

IMAGE=${REPO}/commission-subql:${BUILD_VERSION}


build:
	docker build -f Dockerfile -t ${IMAGE} .
	docker push ${IMAGE}

deploy-test: 
	kubectl apply -f deploy/test/subql.yaml


update-test: build
	kubectl set image deploy -n ${NAMESPACE} commission-subql-test commission-subql-test=${IMAGE}
	kubectl rollout restart deploy -n ${NAMESPACE} commission-subql-test

update: build
	kubectl set image deploy -n ${NAMESPACE} commission-subql commission-subql=${IMAGE}
	kubectl rollout restart deploy -n ${NAMESPACE} commission-subql

restart-proc-only:
	# kubectl rollout restart deploy -n ${NAMESPACE}  

