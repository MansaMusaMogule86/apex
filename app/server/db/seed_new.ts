import { eq } from 'drizzle-orm'
import { createDatabaseContext, getDatabaseContext } from './context'
import { runMigrations } from './migrate'
import { hashPassword } from '../auth/crypto'
import { advisorProfiles, companies, organizations, pipelines, pipelineStages, properties, userCredentials, users } from './schema'

const demoOrgId = 'org_apex_demo'
const otherOrgId = 'org_other_brokerage'
const buyerPipelineId = 'pipe_buyer_leads_uhnw'
const buyerStages = [
  'New Inquiry',
  'AI Qualified',
  'Property Shortlist Sent',
  'Viewing Scheduled',
  'Offer Submitted',
  'SPA Signed',
  'Handover Complete',
  'Long-Term Nurture',
]

const defaultSeedPassword = process.env.APEX_SEED_PASSWORD ?? 'dev-only-password'
let cachedSeedPasswordHash: string | null = null

async function getSeedPasswordHash() {
  if (cachedSeedPasswordHash) return cachedSeedPasswordHash
  cachedSeedPasswordHash = await hashPassword(defaultSeedPassword)
  return cachedSeedPasswordHash
}

export async function seedDatabase(database = getDatabaseContext()) {
  runMigrations(database)

  await database.db.insert(organizations).values([
    { id: demoOrgId, name: 'APEX Demo Realty', slug: 'apex-demo-realty' },
    { id: otherOrgId, name: 'Other Brokerage', slug: 'other-brokerage' },
  ]).onConflictDoNothing()

  await database.db.insert(users).values([
    {
      id: 'user_dalila',
      organizationId: demoOrgId,
      fullName: 'Dalila Laaribi',
      email: 'dalila@apex-demo.local',
      role: 'admin',
      primaryLanguage: 'English',
    },
    {
      id: 'user_camelia',
      organizationId: demoOrgId,
      fullName: 'Camelia Gharbi',
      email: 'camelia@apex-demo.local',
      role: 'manager',
      primaryLanguage: 'French',
    },
    {
      id: 'user_sultan',
      organizationId: demoOrgId,
      fullName: 'Sultan Karabekov',
      email: 'sultan@apex-demo.local',
      role: 'advisor',
      primaryLanguage: 'Russian',
    },
    {
      id: 'user_other',
      organizationId: otherOrgId,
      fullName: 'Other Org Advisor',
      email: 'advisor@other.local',
      role: 'manager',
      primaryLanguage: 'English',
    },
  ]).onConflictDoNothing()

  const credentialSeed = [
    'user_dalila',
    'user_camelia',
    'user_sultan',
    'user_other',
  ]

  const passwordHash = await getSeedPasswordHash()

  for (const userId of credentialSeed) {
    await database.db.insert(userCredentials).values({
      userId,
      passwordHash,
    }).onConflictDoNothing()
  }

  await database.db.insert(advisorProfiles).values([
    {
      userId: 'user_dalila',
      organizationId: demoOrgId,
      specialtiesJson: JSON.stringify(['uhnw', 'buyer']),
      languagesJson: JSON.stringify(['English', 'Arabic']),
      focusLocationsJson: JSON.stringify(['Palm Jumeirah', 'Downtown Dubai']),
      maxBudgetAed: 50000000,
      roundRobinWeight: 1,
    },
    {
      userId: 'user_camelia',
      organizationId: demoOrgId,
      specialtiesJson: JSON.stringify(['investor', 'off-plan']),
      languagesJson: JSON.stringify(['English', 'French']),
      focusLocationsJson: JSON.stringify(['Dubai Marina', 'Business Bay']),
      maxBudgetAed: 15000000,
      roundRobinWeight: 1,
    },
    {
      userId: 'user_sultan',
      organizationId: demoOrgId,
      specialtiesJson: JSON.stringify(['investor', 'buyer']),
      languagesJson: JSON.stringify(['English', 'Russian']),
      focusLocationsJson: JSON.stringify(['Palm Jumeirah', 'Bluewaters Island']),
      maxBudgetAed: 25000000,
      roundRobinWeight: 1,
    },
    {
      userId: 'user_other',
      organizationId: otherOrgId,
      specialtiesJson: JSON.stringify(['buyer']),
      languagesJson: JSON.stringify(['English']),
      focusLocationsJson: JSON.stringify(['Downtown Dubai']),
      maxBudgetAed: 5000000,
      roundRobinWeight: 1,
    },
  ]).onConflictDoNothing()

  await database.db.insert(pipelines).values([
    { id: buyerPipelineId, organizationId: demoOrgId, pipelineKey: 'buyer_leads_uhnw', name: 'Buyer Leads — UHNW' },
    { id: 'pipe_other', organizationId: otherOrgId, pipelineKey: 'buyer_leads_uhnw', name: 'Buyer Leads — UHNW' },
  ]).onConflictDoNothing()

  await database.db.insert(pipelineStages).values(
    buyerStages.flatMap((name, index) => [
      {
        id: `stage_demo_${index + 1}`,
        organizationId: demoOrgId,
        pipelineId: buyerPipelineId,
        stageKey: name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
        name,
        sortOrder: index + 1,
      },
      {
        id: `stage_other_${index + 1}`,
        organizationId: otherOrgId,
        pipelineId: 'pipe_other',
        stageKey: name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
        name,
        sortOrder: index + 1,
      },
    ]),
  ).onConflictDoNothing()

  await database.db.insert(companies).values([
    {
      id: 'company_demo_1',
      organizationId: demoOrgId,
      name: 'Luxe Properties',
      kind: 'developer',
    },
    {
      id: 'company_demo_2',
      organizationId: demoOrgId,
      name: 'Bluewater Holdings',
      kind: 'investor',
    },
    {
      id: 'company_other_1',
      organizationId: otherOrgId,
      name: 'Other Brokerage Group',
      kind: 'brokerage',
    },
  ]).onConflictDoNothing()

  await database.db.insert(properties).values([
    {
      id: 'prop_palm_penthouse',
      organizationId: demoOrgId,
      propertyRef: 'APEX-P1',
      name: 'Palm Jumeirah Sky Residence',
      community: 'Palm Jumeirah',
      propertyType: 'Penthouse',
      developer: 'Nakheel',
      beds: 4,
      baths: 5,
      sizeSqft: 4200,
      priceAed: 23500000,
      status: 'available',
      completion: 'Ready',
    },
    {
      id: 'prop_downtown_2br',
      organizationId: demoOrgId,
      propertyRef: 'APEX-D2',
      name: 'Address Residences Downtown 2BR',
      community: 'Downtown Dubai',
      propertyType: 'Apartment',
      developer: 'Emaar',
      beds: 2,
      baths: 2,
      sizeSqft: 1380,
      priceAed: 2950000,
      status: 'available',
      completion: 'Ready',
    },
    {
      id: 'prop_marina_2br',
      organizationId: demoOrgId,
      propertyRef: 'APEX-M2',
      name: 'Marina Gate Tower 2BR',
      community: 'Dubai Marina',
      propertyType: 'Apartment',
      developer: 'Select Group',
      beds: 2,
      baths: 2,
      sizeSqft: 1310,
      priceAed: 3100000,
      status: 'available',
      completion: 'Ready',
    },
    {
      id: 'prop_bluewaters_3br',
      organizationId: demoOrgId,
      propertyRef: 'APEX-B3',
      name: 'Bluewaters Residences 3BR',
      community: 'Bluewaters Island',
      propertyType: 'Apartment',
      developer: 'Meraas',
      beds: 3,
      baths: 4,
      sizeSqft: 2100,
      priceAed: 8900000,
      status: 'available',
      completion: 'Ready',
    },
    {
      id: 'prop_other_org',
      organizationId: otherOrgId,
      propertyRef: 'OTHER-1',
      name: 'Other Org Listing',
      community: 'Downtown Dubai',
      propertyType: 'Apartment',
      developer: 'Emaar',
      beds: 1,
      baths: 1,
      sizeSqft: 820,
      priceAed: 1500000,
      status: 'available',
      completion: 'Ready',
    },
  ]).onConflictDoNothing()

  const seededOrg = await database.db.query.organizations.findFirst({ where: eq(organizations.id, demoOrgId) })
  return seededOrg?.id ?? demoOrgId
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  const dbFile = process.argv[2]
  const context = dbFile ? createDatabaseContext(dbFile) : getDatabaseContext()
  seedDatabase(context).then((orgId) => {
    console.log(`Seeded database for ${orgId} at ${context.filePath}`)
  })
}