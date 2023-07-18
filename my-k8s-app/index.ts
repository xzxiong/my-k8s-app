import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { decode } from "punycode";
import { it } from "node:test";
import { log } from "console";
import { Secret } from "@pulumi/kubernetes/core/v1";
// import * as random from "@pulumi/random";
import * as k8sSDK from '@kubernetes/client-node';
//const k8s = require('@kubernetes/client-node');

const moobAccountLabelSelector = { "app.kubernetes.io/instance": "prom" };

const kc = new k8sSDK.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8sSDK.CoreV1Api);

console.log("listNamespace")
k8sApi.listNamespace(undefined, undefined, undefined, undefined, "app.kubernetes.io/instance=prom").then((res) => {
    //k8sApi.listNamespace().then((res) => {
    console.log("namespace: ");
    console.log(res.body);

    for (let item of res.body.items) {
        console.log("name %s", item.metadata?.name);
    }
});

// other
const ns = "mo-ob"

console.log("Namespace.get")
const n = k8s.core.v1.Namespace.get("mo-ob-account", "")
console.log(n.metadata)

// Get the secret named "mysecret" in the "default" namespace
let mySecret = k8s.core.v1.Secret.get("my-secret", "default/prom-grafana");
// const mySecret = pulumi.output(k8s.core.v1.getSecret({
//     name: "prom-grafana",
//     namespace: "default",
// }));

// Export the secret's name.
export const secretName = mySecret.metadata.name;

// Decode the secret data
const decodedSecret = mySecret.data.apply(data => {
    const decoded: { [key: string]: string } = {};
    for (const k in data) {
        decoded[k] = Buffer.from(data[k], 'base64').toString();
    }
    return decoded;
});

console.log("decodedSecret")
decodedSecret.apply(item => console.log(item));
// Export the decoded secret
export const secret = decodedSecret;
export const user = decodedSecret["admin-user"];
console.log("user")
user.apply(item => console.log(item));


const moDbSecret = new k8s.core.v1.Secret("ruler-mo-secret", {
    metadata: {
        name: "ruler-mo-secret",
        namespace: ns,
    },
    type: "Opaque",
    data: {
        host: Buffer.from("free2-mo-namespace").toString('base64'),
        port: Buffer.from("6001").toString('base64'),
        user: user,
        password: decodedSecret["admin-password"],
    },
});

moDbSecret.data.apply(item => console.log(item));


/*
// example
apiVersion: v1
data:
  admin-password: cHJvbS1vcGVyYXRvcg==
  admin-user: YWRtaW4=
  ldap-toml: ""
kind: Secret
metadata:
  annotations:
    meta.helm.sh/release-name: prom
    meta.helm.sh/release-namespace: default
  creationTimestamp: "2023-06-26T10:01:05Z"
  labels:
    app.kubernetes.io/instance: prom
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/name: grafana
    app.kubernetes.io/version: 9.1.6
    helm.sh/chart: grafana-6.40.0
  name: prom-grafana
  namespace: default
  resourceVersion: "185848"
  uid: bb5c0fc0-e14c-4b43-b686-e02c27c95517
type: Opaque
*/


//const mySecrets = k8s.core.v1.SecretList.get("my-secrets", "", { labelSelector: moobAccountLabelSelector });
//const secretNames = mySecrets.items.apply(items => items.map(i => i.metadata.name));
//secretNames.apply(name => console.log(name));


//const moobCloudSecret = getMOcloudMOOBUser()
//const moobCloudSecret = getMOcloudMOOBUser({ "matrixone.cloud/role": "observability"})

/*
const config = new pulumi.Config();
const k8sNamespace = config.get("k8sNamespace") || "default";
const appLabels = {
    app: "nginx-ingress",
};

// Create a namespace (user supplies the name of the namespace)
const ingressNs = new k8s.core.v1.Namespace("ingressns", {
    metadata: {
        labels: appLabels,
        name: k8sNamespace,
    }
});

// Use Helm to install the Nginx ingress controller
const ingressController = new k8s.helm.v3.Release("ingresscontroller", {
    chart: "nginx-ingress",
    namespace: ingressNs.metadata.name,
    repositoryOpts: {
        repo: "https://helm.nginx.com/stable",
    },
    skipCrds: true,
    values: {
        controller: {
            enableCustomResources: false,
            appprotect: {
                enable: false,
            },
            appprotectdos: {
                enable: false,
            },
            service: {
                extraLabels: appLabels,
            },
        },
    },
    version: "0.14.1",
});
/*

// Export some values for use elsewhere
//export const name = ingressController.name;



// ----------------------------------------------------------------
// -- mo agent stack --------------------------------

const releaseName = "mo-ruler-stack"


// fake secret for mo-ruler-stack
// fake secret for grafana

/*
const hostQpa = new random.RandomPet("matrixone.xiezexiong");
const portQpa = new random.RandomPet("6001");
const userQpa = new random.RandomPet("monitor-mo-ob");
const passwordQpa = new random.RandomPassword("password", {
    length: 16,
    special: false,
});

const moDbSecret = new k8s.core.v1.Secret("ruler-mo-secret", {
    metadata: {
        name: "ruler-mo-secret",
        namespace: ns,
    },
    type: "Opaque",
    data: {
        host: hostQpa.id,
        port: portQpa.id,
        user: userQpa.id,
        password: passwordQpa.id,
    },
});


const clientIDQpa = new random.RandomPet("client_id");
const clientSecretQpa = new random.RandomPet("client_secret");
const oauthSecret = new k8s.core.v1.Secret("auth-generic-oauth-secret", {
    metadata: {
        name: "auth-generic-oauth-secret",
        namespace: ns,
    },
    type: "Opaque",
    data: {
        "client_id": clientIDQpa.id,
        "client_secret": clientSecretQpa.id,
    },
});
*/

// resources/observability/charts/mo-ruler-stack
/*
const moRulerStack = new k8s.helm.v3.Chart(releaseName, {
    path: "resources/observability/charts/mo-ruler-stack",
    namespace: ns,
    values: {
        grafana: {
            enabled: true,
            admin: {
                existingSecret: "grafana-admin-secret",
                userKey: "admin-user",
                passwordKey: "admin-password",
            },
            extraSecretMounts: [{
                name: "auth-generic-oauth-secret-mount",
                secretName: "auth-generic-oauth-secret",
                defautMode: "0440",
                mountPath: "/etc/secrets/auth_generic_oauth",
                readOnly: true,
            }],
            "grafana.ini": {
                "auth.generic_oauth": {
                    name: "dex",
                    enabled: true,
                    scopes: "openid profile email offline_access",
                    auth_url: "https://oidc.matrixorigin.cn:31443/dex/auth",
                    token_url: "https://oidc.matrixorigin.cn:31443/dex/token",
                    api_url: "https://oidc.matrixorigin.cn:31443/dex/userinfo",
                    allow_sign_up: true,
                    client_id: "$__file{/etc/secrets/auth_generic_oauth/client_id}",
                    client_secret: "$__file{/etc/secrets/auth_generic_oauth/client_secret}",
                },
            },
            service: {
                enabled: true,
                type: "LoadBalancer",
                port: 3000,
                targetPort: 3000,
                annotations: {},
                labels: {},
                portName: "service",
                appPortocal: "",
            },
            sidecar: {
                dashboards: {
                    enabled: true,
                },
                datasources: {
                    enabled: true,
                }
            }
        },
        alertmanager: {
            enabled: false,
            replicaCount: 1,
            config: {

            },
        },
        moRuler: {
            replicaCount: 1,
            image: {
                repository: "matrixorigin/observability",
                tag: "mo-ruler-0.7.0",
                pullPolicy: "Always",
            },
            extraSecretMounts: [{
                name: "ruler-mo-secret-mount",
                secretName: "ruler-mo-secret",
                defautMode: "0440",
                mountPath: "/etc/secrets/ruler-mo-secret",
                readOnly: true,
            }],
            rulerSpec: {
                alerting: {
                    alertingEndpoint: {
                        scheme: "http",
                        targets: [
                            "mo-ruler-stack-alertmanager.mo-ob:9093",
                        ],
                    }
                },
                ruler: {
                    mo: {
                        host: "matrixone.xiezexiong",
                        port: 6001,
                        user: "$__file{/etc/secrets/ruler-mo-secret/user}",
                        password: "$__file{/etc/secrets/ruler-mo-secret/password}",
                    },
                }
            },
        }
    },
})*/


// Create a ConfigMap depending on the Chart. The ConfigMap will not be created until after all of the Chart
// resources are ready. Note the use of the `ready` attribute; depending on the Chart resource directly will not work.
/*
const rulerDatasouceConfig = new k8s.core.v1.ConfigMap("mo-ob-ruler-datasource", {
    metadata: {
        namespace: ns,
        labels: {
            grafana_datasouce: "1",
            release: releaseName,
        },
        annotations: {
            "meta.helm.sh/release-name": "ruler",
        }
    },
    data: {
        "ruler-stack-datasource.yaml": `
apiVersion: 1,
datasources:
- name: MOOB-Control-Plane
  type: prometheus
  url: http://mo-ruler-service.`+ ns + `:9199
  access: proxy
  isDefault: true
`,
    },
}, { dependsOn: moRulerStack.ready })
*/