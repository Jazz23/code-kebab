{{- define "code-kebab.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "code-kebab.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "code-kebab.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "code-kebab.labels" -}}
helm.sh/chart: {{ include "code-kebab.chart" . }}
app.kubernetes.io/name: {{ include "code-kebab.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "code-kebab.selectorLabels" -}}
app.kubernetes.io/name: {{ include "code-kebab.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "code-kebab.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "code-kebab.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{- define "code-kebab.appEnvSecretName" -}}
{{- printf "%s-env" (include "code-kebab.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "code-kebab.cnpgClusterName" -}}
{{- if .Values.cnpg.clusterName -}}
{{- .Values.cnpg.clusterName | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-db" (include "code-kebab.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "code-kebab.cnpgAppSecretName" -}}
{{- printf "%s-app" (include "code-kebab.cnpgClusterName" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "code-kebab.databaseSecretName" -}}
{{- if .Values.database.existingSecret.name -}}
{{- .Values.database.existingSecret.name | trunc 63 | trimSuffix "-" -}}
{{- else if .Values.cnpg.enabled -}}
{{- include "code-kebab.cnpgAppSecretName" . -}}
{{- end -}}
{{- end -}}

{{- define "code-kebab.migratorImageRepository" -}}
{{- if .Values.migration.image.repository -}}
{{- .Values.migration.image.repository -}}
{{- else -}}
{{- printf "%s-migrate" .Values.image.repository -}}
{{- end -}}
{{- end -}}

{{- define "code-kebab.migratorImageTag" -}}
{{- if .Values.migration.image.tag -}}
{{- .Values.migration.image.tag -}}
{{- else if .Values.image.tag -}}
{{- .Values.image.tag -}}
{{- else -}}
{{- .Chart.AppVersion -}}
{{- end -}}
{{- end -}}

{{- define "code-kebab.migrationJobName" -}}
{{- printf "%s-db-migrate" (include "code-kebab.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "code-kebab.gatewayName" -}}
{{- printf "%s-gateway" (include "code-kebab.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "code-kebab.gatewayTlsSecretName" -}}
{{- if .Values.gateway.https.tlsSecretName -}}
{{- .Values.gateway.https.tlsSecretName | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-tls" (include "code-kebab.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "code-kebab.clusterIssuerName" -}}
{{- if .Values.gateway.clusterIssuer.name -}}
{{- .Values.gateway.clusterIssuer.name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-issuer" (include "code-kebab.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "code-kebab.clusterIssuerPrivateKeySecretName" -}}
{{- if .Values.gateway.clusterIssuer.privateKeySecretName -}}
{{- .Values.gateway.clusterIssuer.privateKeySecretName | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-acme-account-key" (include "code-kebab.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "code-kebab.certificateName" -}}
{{- if .Values.gateway.certificate.name -}}
{{- .Values.gateway.certificate.name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-certificate" (include "code-kebab.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
