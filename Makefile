REPO=harbor.liebi.com/commission
BUILD_VERSION   := $(shell git log -1 --pretty='%h')
NAMESPACE := commission

# 在不同的目录下 project.yaml 配置不同
IMAGE=${REPO}/commission-subql:${BUILD_VERSION}
IMAGE-K=${REPO}/kusama-commission-subql:${BUILD_VERSION}
IMAGE-P=${REPO}/polkadot-commission-subql:${BUILD_VERSION}


build-test:
	docker build -f Dockerfile -t ${IMAGE} .
	docker push ${IMAGE}

build-kusama:
	docker build -f Dockerfile -t ${IMAGE-K} .
	docker push ${IMAGE-K}

build-polkadot:
	docker build -f Dockerfile -t ${IMAGE-P} .
	docker push ${IMAGE-P}

deploy-test: 
	kubectl apply -f deploy/test/subql.yaml


update-test: build-test
	kubectl set image deploy -n ${NAMESPACE} commission-subql-test commission-subql-test=${IMAGE}
	kubectl rollout restart deploy -n ${NAMESPACE} commission-subql-test

update: build
	kubectl set image deploy -n ${NAMESPACE} commission-subql commission-subql=${IMAGE}
	kubectl rollout restart deploy -n ${NAMESPACE} commission-subql

update-polkadot: build-polkadot
	kubectl set image deploy -n ${NAMESPACE} polkadot-commission-subql polkadot-commission-subql=${IMAGE}
	kubectl rollout restart deploy -n ${NAMESPACE} polkadot-commission-subql

update-kusama: build-kusama
	kubectl set image deploy -n ${NAMESPACE} kusama-commission-subql kusama-commission-subql=${IMAGE}
	kubectl rollout restart deploy -n ${NAMESPACE} kusama-commission-subql


restart-proc-only:
	# kubectl rollout restart deploy -n ${NAMESPACE}  

