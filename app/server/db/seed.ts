import { eq } from 'drizzle-orm'
import { createDatabaseContext, getDatabaseContext } from './context'
import { runMigrations } from './migrate'
import { hashPassword } from '../auth/crypto'
import { advisorProfiles, companies, organizations, pipelines, pipelineStages, properties, userCredentials, users } from './schema'

const demoOrgId = 'org_nexus_demo'
const otherOrgId = 'org_other_company'
const salesPipelineId = 'pipe_sales_standard'
const salesStages = [
  'New Lead',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
  'On Hold',
]

const defaultSeedPassword = process.env.NEXUS_SEED_PASSWORD ?? 'dev-only-password'
let cachedSeedPasswordHash: string | null = null

async function getSeedPasswordHash() {
  if (cachedSeedPasswordHash) return cachedSeedPasswordHash
  cachedSeedPasswordHash = await hashPassword(defaultSeedPassword)
  return cachedSeedPasswordHash
}

export async function seedDatabase(database = getDatabaseContext()) {
  runMigrations(database)

  await database.db.insert(organizations).values([
    { id: demoOrgId, name: 'Nexus Demo Company', slug: 'nexus-demo-company' },
    { id: otherOrgId, name: 'Other Company', slug: 'other-company' },
  ]).onConflictDoNothing()

  await database.db.insert(users).values([
    {
      id: 'user_admin',
      organizationId: demoOrgId,
      fullName: 'Alex Admin',
      email: 'admin@nexus-demo.local',
      role: 'admin',
      primaryLanguage: 'English',
    },
    {
      id: 'user_manager',
      organizationId: demoOrgId,
      fullName: 'Morgan Manager',
      email: 'manager@nexus-demo.local',
      role: 'manager',
      primaryLanguage: 'English',
    },
    {
      id: 'user_sales',
      organizationId: demoOrgId,
      fullName: 'Sam Sales',
      email: 'sales@nexus-demo.local',
      role: 'advisor',
      primaryLanguage: 'English',
    },
    {
      id: 'user_other',
      organizationId: otherOrgId,
      fullName: 'Other User',
      email: 'user@other.local',
      role: 'manager',
      primaryLanguage: 'English',
    },
  ]).onConflictDoNothing()

  const credentialSeed = [
    'user_admin',
    'user_manager',
    'user_sales',
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
      userId: 'user_admin',
      organizationId: demoOrgId,
      specialtiesJson: JSON.stringify(['sales', 'management']),
      languagesJson: JSON.stringify(['English']),
      focusLocationsJson: JSON.stringify(['Global']),
      maxBudgetAed: 100000000,
      roundRobinWeight: 1,
    },
    {
      userId: 'user_manager',
      organizationId: demoOrgId,
      specialtiesJson: JSON.stringify(['account_management', 'strategy']),
      languagesJson: JSON.stringify(['English']),
      focusLocationsJson: JSON.stringify(['Global']),
      maxBudgetAed: 50000000,
      roundRobinWeight: 1,
    },
    {
      userId: 'user_sales',
      organizationId: demoOrgId,
      specialtiesJson: JSON.stringify(['outbound', 'closing']),
      languagesJson: JSON.stringify(['English']),
      focusLocationsJson: JSON.stringify(['Global']),
      maxBudgetAed: 10000000,
      roundRobinWeight: 1,
    },
  ]).onConflictDoNothing()

  await database.db.insert(pipelines).values([
    { id: salesPipelineId, organizationId: demoOrgId, pipelineKey: 'sales_standard', name: 'Standard Sales Pipeline' },
    { id: 'pipe_other', organizationId: otherOrgId, pipelineKey: 'other', name: 'Other Pipeline' },
  ]).onConflictDoNothing()

  await database.db.insert(pipelineStages).values([
    ...salesStages.map((name, index) => ({
      id: `stage_sales_${index + 1}`,
      organizationId: demoOrgId,
      pipelineId: salesPipelineId,
      stageKey: name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
      name,
      sortOrder: index + 1,
    })),
    ...['Lead', 'Contacted', 'Proposal', 'Won', 'Lost'].map((name, index) => ({
      id: `stage_other_${index + 1}`,
      organizationId: otherOrgId,
      pipelineId: 'pipe_other',
      stageKey: name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
      name,
      sortOrder: index + 1,
    })),
  ]).onConflictDoNothing()

  await database.db.insert(companies).values([
    {
      id: 'company_demo_1',
      organizationId: demoOrgId,
      name: 'Acme Corporation',
      kind: 'customer',
    },
    {
      id: 'company_demo_2',
      organizationId: demoOrgId,
      name: 'TechStart Inc',
      kind: 'prospect',
    },
    {
      id: 'company_other_1',
      organizationId: otherOrgId,
      name: 'Other Company Group',
      kind: 'partner',
    },
  ]).onConflictDoNothing()

  await database.db.insert(properties).values([
    {
      id: 'prod_enterprise_plan',
      organizationId: demoOrgId,
      propertyRef: 'NEXUS-EP',
      name: 'Enterprise Plan',
      community: 'Software',
      propertyType: 'Subscription',
      developer: 'Nexus',
      beds: 0,
      baths: 0,
      sizeSqft: 0,
      priceAed: 990000,
      status: 'available',
      completion: 'Active',
    },
    {
      id: 'prod_pro_plan',
      organizationId: demoOrgId,
      propertyRef: 'NEXUS-PP',
      name: 'Professional Plan',
      community: 'Software',
      propertyType: 'Subscription',
      developer: 'Nexus',
      beds: 0,
      baths: 0,
      sizeSqft: 0,
      priceAed: 290000,
      status: 'available',
      completion: 'Active',
    },
    {
      id: 'prod_starter_plan',
      organizationId: demoOrgId,
      propertyRef: 'NEXUS-SP',
      name: 'Starter Plan',
      community: 'Software',
      propertyType: 'Subscription',
      developer: 'Nexus',
      beds: 0,
      baths: 0,
      sizeSqft: 0,
      priceAed: 99000,
      status: 'available',
      completion: 'Active',
    },
    {
      id: 'prod_other_org',
      organizationId: otherOrgId,
      propertyRef: 'OTHER-1',
      name: 'Other Org Product',
      community: 'Services',
      propertyType: 'Service',
      developer: 'Other',
      beds: 0,
      baths: 0,
      sizeSqft: 0,
      priceAed: 500000,
      status: 'available',
      completion: 'Active',
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








