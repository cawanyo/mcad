"use client"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20, color: "#1e40af" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", marginBottom: 8, color: "#374151", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 4 },
  row: { flexDirection: "row", gap: 8, marginBottom: 4 },
  label: { fontSize: 10, color: "#6b7280", width: 80 },
  value: { fontSize: 10, color: "#111827", flex: 1 },
  serviceItem: { fontSize: 10, color: "#374151", marginBottom: 2, paddingLeft: 12 },
  poleName: { fontSize: 11, fontWeight: "bold", color: "#1e40af", marginTop: 8, marginBottom: 4 },
})

interface EventDetailPDFProps {
  activite: {
    nom: string
    date: Date | string
    heureDebut: string
    heureFin: string
    description?: string | null
    services: { nom: string; user: { nom: string; prenom: string } | null; pole: { nom: string } }[]
  }
}

export default function EventDetailPDF({ activite }: EventDetailPDFProps) {
  const grouped = activite.services.reduce<Record<string, typeof activite.services>>((acc, s) => {
    if (!acc[s.pole.nom]) acc[s.pole.nom] = []
    acc[s.pole.nom].push(s)
    return acc
  }, {})

  const dateStr = typeof activite.date === "string"
    ? new Date(activite.date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : activite.date.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{activite.nom}</Text>
        <View style={styles.section}>
          <View style={styles.row}><Text style={styles.label}>Date</Text><Text style={styles.value}>{dateStr}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Horaire</Text><Text style={styles.value}>{activite.heureDebut} – {activite.heureFin}</Text></View>
          {activite.description && <View style={styles.row}><Text style={styles.label}>Description</Text><Text style={styles.value}>{activite.description}</Text></View>}
        </View>
        {Object.keys(grouped).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            {Object.entries(grouped).map(([poleName, services]) => (
              <View key={poleName}>
                <Text style={styles.poleName}>{poleName}</Text>
                {services.map((s, i) => (
                  <Text key={i} style={styles.serviceItem}>
                    • {s.nom} : {s.user ? `${s.user.prenom} ${s.user.nom}` : "Non assigné"}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}
