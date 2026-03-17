"use client"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 24, color: "#1e40af", textAlign: "center" },
  dayBlock: { marginBottom: 16 },
  dayName: { fontSize: 12, fontWeight: "bold", color: "#374151", marginBottom: 6 },
  event: { flexDirection: "row", gap: 8, marginBottom: 4, paddingLeft: 8 },
  time: { fontSize: 10, color: "#6b7280", width: 50 },
  eventName: { fontSize: 10, color: "#111827" },
  noEvent: { fontSize: 10, color: "#9ca3af", paddingLeft: 8, fontStyle: "italic" },
})

interface WeeklyCalendarPDFProps {
  weekLabel: string
  days: { label: string; activites: { nom: string; heureDebut: string }[] }[]
}

export default function WeeklyCalendarPDF({ weekLabel, days }: WeeklyCalendarPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{weekLabel}</Text>
        {days.map((day) => (
          <View key={day.label} style={styles.dayBlock}>
            <Text style={styles.dayName}>{day.label}</Text>
            {day.activites.length === 0 ? (
              <Text style={styles.noEvent}>Pas d'activité</Text>
            ) : (
              day.activites.map((a, i) => (
                <View key={i} style={styles.event}>
                  <Text style={styles.time}>{a.heureDebut}</Text>
                  <Text style={styles.eventName}>{a.nom}</Text>
                </View>
              ))
            )}
          </View>
        ))}
      </Page>
    </Document>
  )
}
