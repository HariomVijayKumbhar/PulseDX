import 'dotenv/config';
import { supabase } from '../src/lib/supabaseClient';

async function seed() {
  console.log('🌱 Starting Supabase seed script...');

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  try {
    // 1. Clean existing sample data
    console.log('🧹 Cleaning existing records...');
    await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Create Supabase Auth accounts FIRST so we know the real auth UUIDs
    console.log('🔐 Creating demo Auth accounts (password: Demo1234!)...');
    const demoAccounts = [
      { email: 'alex.vance@acme-labs.io', name: 'Alex Vance', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', role: 'lead_developer' },
      { email: 'marcus.chen@acme-labs.io', name: 'Marcus Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', role: 'senior_engineer' },
      { email: 'elena.rostova@acme-labs.io', name: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', role: 'devops_engineer' },
    ];

    const usersToInsert: any[] = [];
    for (const acct of demoAccounts) {
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: acct.email,
        password: 'Demo1234!',
        email_confirm: true, // seed/demo accounts skip confirmation by design
        user_metadata: { full_name: acct.name, name: acct.name, avatar_url: acct.avatar },
      });
      if (authErr && !authErr.message.toLowerCase().includes('already')) {
        console.warn(`⚠️  Auth account ${acct.email}: ${authErr.message}`);
      } else {
        console.log(`✅ Auth account ready: ${acct.email}`);
      }
      let authId: string | undefined = authData?.user?.id;
      if (!authId && authErr) {
        // User already exists — look up their existing auth UUID
        const { data: listData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        authId = listData?.users?.find((u) => u.email === acct.email)?.id;
      }
      if (!authId) {
        console.warn(`⚠️  Could not resolve auth ID for ${acct.email}`);
      }
      usersToInsert.push({
        id: authId, // real auth UUID — falls back to a generated one only if unresolvable
        name: acct.name,
        email: acct.email,
        avatar_url: acct.avatar,
        role: acct.role,
      });
    }
    console.log('💡 Demo logins — alex.vance@acme-labs.io / Demo1234! (and marcus/elena same password)');

    const { data: users, error: userError } = await supabase
      .from('users')
      .upsert(usersToInsert)
      .select('*');

    if (userError || !users) {
      throw new Error(`Failed to insert users: ${userError?.message}`);
    }
    console.log(`✅ Created ${users.length} users`);

    const alex = users.find((u) => u.email === 'alex.vance@acme-labs.io')!;
    const marcus = users.find((u) => u.email === 'marcus.chen@acme-labs.io')!;

    // 3. Insert Projects
    console.log('📁 Inserting projects...');
    const projectsToInsert = [
      {
        name: 'Nexus Cloud Control Plane',
        description: 'Next-generation distributed cloud orchestrator and multi-region Kubernetes gateway UI.',
        owner_id: alex.id,
        status: 'in_progress',
      },
      {
        name: 'Synthetic Data & ML Pipeline',
        description: 'Automated privacy-preserving synthetic data generation engine with differential privacy.',
        owner_id: alex.id,
        status: 'in_progress',
      },
      {
        name: 'Pulse Design System v3',
        description: 'Component library overhaul with tokenized micro-interactions and dark mode.',
        owner_id: alex.id,
        status: 'active',
      },
      {
        name: 'Apex Edge Cache API Gateway',
        description: 'Ultra-low latency global caching worker layer with Cloudflare Workers and WebAssembly.',
        owner_id: marcus.id,
        status: 'planning',
      },
    ];

    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .insert(projectsToInsert)
      .select('*');

    if (projectError || !projects) {
      throw new Error(`Failed to insert projects: ${projectError?.message}`);
    }
    console.log(`✅ Created ${projects.length} projects`);

    const nexus = projects.find((p) => p.name === 'Nexus Cloud Control Plane')!;
    const synth = projects.find((p) => p.name === 'Synthetic Data & ML Pipeline')!;
    const pulse = projects.find((p) => p.name === 'Pulse Design System v3')!;
    const apex = projects.find((p) => p.name === 'Apex Edge Cache API Gateway')!;

    // 4. Insert Tasks
    console.log('📝 Inserting tasks...');
    const tasksToInsert = [
      {
        title: 'Implement dynamic 3D topology telemetry visualization',
        description: 'Use React Three Fiber to display cluster nodes with live throughput pulses.',
        project_id: nexus.id,
        assignee_id: alex.id,
        status: 'in-progress',
        priority: 'high',
        due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      },
      {
        title: 'Optimize gRPC streaming channel heartbeat timeout',
        description: 'Reduce connection drop rate across multi-cloud regions by tuning Envoy parameters.',
        project_id: nexus.id,
        assignee_id: marcus.id,
        status: 'todo',
        priority: 'urgent',
        due_date: new Date(Date.now() + 3 * 86400000).toISOString(),
      },
      {
        title: 'Benchmark diffusion noise scheduling in synthetic data sampler',
        description: 'Evaluate inference speedup when quantizing unet weights to FP8.',
        project_id: synth.id,
        assignee_id: alex.id,
        status: 'in-progress',
        priority: 'high',
        due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
      },
      {
        title: 'Publish accessible dark mode color scales to npm registry',
        description: 'Ensure all contrast ratios satisfy APCA bronze level and WCAG 2.2 AAA standards.',
        project_id: pulse.id,
        assignee_id: alex.id,
        status: 'done',
        priority: 'medium',
        due_date: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        title: 'Compile Rust SHA-256 token verification routine to WebAssembly',
        description: 'Ensure memory footprint is under 64KB for edge deployment on Cloudflare Workers.',
        project_id: apex.id,
        assignee_id: marcus.id,
        status: 'in-progress',
        priority: 'urgent',
        due_date: new Date(Date.now() + 4 * 86400000).toISOString(),
      },
    ];

    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select('*');

    if (taskError || !tasks) {
      throw new Error(`Failed to insert tasks: ${taskError?.message}`);
    }
    console.log(`✅ Created ${tasks.length} tasks`);

    console.log('\n🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
