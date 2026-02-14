import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
  type DocumentProps,
} from "@react-pdf/renderer";
import type { Blueprint } from "@/lib/schema";

/* ----------------------------------
   Brand Colors
----------------------------------- */

const GOLD = "#C6A75E";
const DARK = "#0B0B0C";
const PANEL = "#141416";
const BORDER = "#E5E7EB";
const TEXT_DARK = "#111827";
const MUTED_DARK = "#6B7280";

/* ----------------------------------
   Styles
----------------------------------- */

const styles = StyleSheet.create({
  /* ===== COVER PAGE ===== */
  coverPage: {
    padding: 60,
    backgroundColor: DARK,
    color: "#FFFFFF",
    justifyContent: "center",
  },

  coverLogoWrap: {
    alignItems: "center",
    marginBottom: 30,
  },

  coverLogo: {
    width: 70,
    height: 70,
    marginBottom: 20,
  },

  coverTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: GOLD,
    textAlign: "center",
    marginBottom: 10,
  },

  coverSubtitle: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 30,
  },

  coverMeta: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 6,
  },

  coverFooter: {
    position: "absolute",
    bottom: 40,
    left: 60,
    right: 60,
    textAlign: "center",
    fontSize: 10,
    opacity: 0.5,
  },

  /* ===== INTERIOR PAGES ===== */

  page: {
    paddingTop: 70,
    paddingBottom: 50,
    paddingHorizontal: 50,
    backgroundColor: "#FFFFFF",
    color: TEXT_DARK,
    fontSize: 11,
    fontFamily: "Helvetica",
  },

  header: {
    position: "absolute",
    top: 30,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: MUTED_DARK,
  },

  footer: {
    position: "absolute",
    bottom: 25,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: MUTED_DARK,
  },

  title: {
    fontSize: 18,
    fontWeight: 700,
    color: GOLD,
    marginBottom: 6,
  },

  section: {
    marginTop: 18,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  sectionBar: {
    width: 4,
    height: 14,
    backgroundColor: GOLD,
    marginRight: 8,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
  },

  card: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },

  paragraph: {
    lineHeight: 1.5,
  },

  bulletRow: {
    flexDirection: "row",
    marginTop: 5,
  },

  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: GOLD,
    marginTop: 4,
    marginRight: 8,
  },

  bulletText: {
    flex: 1,
    lineHeight: 1.4,
  },

  resourceCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },

  link: {
    fontSize: 9,
    color: "#2563EB",
  },
});

/* ----------------------------------
   Helpers
----------------------------------- */

function safeStr(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim().length ? v : fallback;
}

function safeArr(v: unknown): string[] {
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string")
    : [];
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionBar} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((it, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={styles.bulletDot} />
          <Text style={styles.bulletText}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

/* ----------------------------------
   Main Builder
----------------------------------- */

export function buildBlueprintPdfDocument(
  blueprint: Blueprint,
): React.ReactElement<DocumentProps> {
  const header = blueprint.header;
  const overview = blueprint.overview;

  const title = safeStr(header?.title, "Blueprint");
  const role = safeStr(header?.role);
  const leader = safeStr(header?.preparedFor?.leaderName);
  const group = safeStr(header?.preparedFor?.groupName);

  const resources = Array.isArray(blueprint.recommendedResources)
    ? blueprint.recommendedResources
    : [];

  return (
    <Document>
      {/* ===========================
          COVER PAGE
      ============================ */}
      <Page size="LETTER" style={styles.coverPage}>
        <View style={styles.coverLogoWrap}>
          {/* Replace with absolute path if needed */}
          <Image
            src={`${process.env.NEXT_PUBLIC_SITE_URL}/dd-logo.png`}
            style={styles.coverLogo}
          />
        </View>

        <Text style={styles.coverTitle}>{title}</Text>
        <Text style={styles.coverSubtitle}>
          Discipleship by Design Blueprint
        </Text>

        <Text style={styles.coverMeta}>Role: {role}</Text>
        <Text style={styles.coverMeta}>Leader: {leader}</Text>
        <Text style={styles.coverMeta}>Group: {group}</Text>

        <Text style={styles.coverFooter}>
          Teach With Intention · Generated {new Date().toLocaleDateString()}
        </Text>
      </Page>

      {/* ===========================
          INTERIOR PAGE
      ============================ */}
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <Text>Discipleship by Design</Text>
          <Text>{group}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Teach With Intention</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>

        <Text style={styles.title}>{title}</Text>

        {/* Executive Summary */}
        <View style={styles.section}>
          <SectionTitle title="Executive Summary" />
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              {safeStr(overview?.executiveSummary)}
            </Text>
          </View>
        </View>

        {/* Formation Goal */}
        <View style={styles.section}>
          <SectionTitle title="Formation Goal" />
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              {safeStr(overview?.outcomes?.formationGoal)}
            </Text>
          </View>
        </View>

        {/* Indicators */}
        <View style={styles.section}>
          <SectionTitle title="Measurable Indicators" />
          <View style={styles.card}>
            <BulletList
              items={safeArr(overview?.outcomes?.measurableIndicators)}
            />
          </View>
        </View>

        {/* Resources */}
        {resources.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="Recommended Resources" />
            {resources.map((r, i) => (
              <View key={i} style={styles.resourceCard}>
                <Text style={{ fontWeight: 700, color: GOLD }}>
                  {safeStr(r.title)}
                </Text>
                <Text style={{ fontSize: 10 }}>
                  {safeStr(r.author)} · {safeStr(r.publisher)}
                </Text>

                {r.amazonUrl && (
                  <Text style={{ marginTop: 4 }}>
                    <Link src={r.amazonUrl} style={styles.link}>
                      Amazon
                    </Link>
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
