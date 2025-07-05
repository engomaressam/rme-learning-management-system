import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from '../src/config';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Admin User
  const hashedPassword = await bcrypt.hash(config.admin.password, 12);
  const adminUser = await prisma.user.upsert({
    where: { email: config.admin.email },
    update: {},
    create: {
      email: config.admin.email,
      password: hashedPassword,
      firstName: config.admin.firstName,
      lastName: config.admin.lastName,
      employeeId: 'ADM001',
      department: 'Information Technology',
      grade: 'L5',
      role: 'ADMINISTRATOR'
    }
  });

  console.log('✅ Admin user created');

  // Create test users with mustChangePassword=true for testing the forced password change flow
  const testUsers = [
    {
      email: 'omar.essam@rowad-rme.com',
      firstName: 'Omar',
      lastName: 'Essam',
      employeeId: 'TST001',
      department: 'IT',
      grade: 'L3',
      role: 'EMPLOYEE'
    },
    {
      email: 'ahmed.hassan@rowad-rme.com',
      firstName: 'Ahmed',
      lastName: 'Hassan',
      employeeId: 'TST002',
      department: 'Engineering',
      grade: 'L4',
      role: 'MANAGER'
    },
    {
      email: 'sara.mohamed@rowad-rme.com',
      firstName: 'Sara',
      lastName: 'Mohamed',
      employeeId: 'TST003',
      department: 'HR',
      grade: 'L2',
      role: 'EMPLOYEE'
    },
    {
      email: 'dyaa@rowad-rme.com',
      firstName: 'Dyaa',
      lastName: 'Khalil',
      employeeId: 'TST004',
      department: 'Marketing',
      grade: 'L3',
      role: 'EMPLOYEE'
    },
    {
      email: 'ramy.ahmed@rowad-rme.com',
      firstName: 'Ramy',
      lastName: 'Ahmed',
      employeeId: 'TST005',
      department: 'Finance',
      grade: 'L4',
      role: 'MANAGER'
    }
  ];

  for (const userData of testUsers) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: await bcrypt.hash('password123', 12),
        firstName: userData.firstName,
        lastName: userData.lastName,
        employeeId: userData.employeeId,
        department: userData.department,
        grade: userData.grade,
        role: userData.role as any,
        mustChangePassword: true
      }
    });
  }

  console.log('✅ Test users with mustChangePassword=true created');

  // Create sample departments and users
  const departments = ['HR', 'Engineering', 'Sales', 'Marketing', 'Finance'];
  const grades = ['L1', 'L2', 'L3', 'L4', 'L5'];
  const sampleUsers = [];

  // Create Manager Users
  for (let i = 0; i < 3; i++) {
    const manager = await prisma.user.create({
      data: {
        email: `manager${i + 1}@company.com`,
        password: await bcrypt.hash('password123', 12),
        firstName: `Manager${i + 1}`,
        lastName: 'User',
        employeeId: `MGR00${i + 1}`,
        department: departments[i % departments.length],
        grade: grades[Math.floor(Math.random() * 2) + 3], // L4 or L5
        role: 'MANAGER'
      }
    });
    sampleUsers.push(manager);
  }

  // Create Employee Users
  for (let i = 0; i < 20; i++) {
    const managerId: string = sampleUsers[Math.floor(Math.random() * sampleUsers.length)].id;
    const employee: any = await prisma.user.create({
      data: {
        email: `employee${i + 1}@company.com`,
        password: await bcrypt.hash('password123', 12),
        firstName: `Employee${i + 1}`,
        lastName: 'User',
        employeeId: `EMP${String(i + 1).padStart(3, '0')}`,
        department: departments[i % departments.length],
        grade: grades[Math.floor(Math.random() * 3)], // L1, L2, or L3
        role: 'EMPLOYEE',
        managerId: Math.random() > 0.3 ? managerId : undefined
      }
    });
    sampleUsers.push(employee);
  }

  console.log('✅ Sample users created');

  // Create Providers
  const internalProvider = await prisma.provider.create({
    data: {
      name: 'RME In-house Training',
      type: 'INTERNAL',
      contactEmail: 'training@company.com',
      contactPhone: '+1-555-0123'
    }
  });

  const externalProvider = await prisma.provider.create({
    data: {
      name: 'Excellence Training Solutions',
      type: 'EXTERNAL',
      contactEmail: 'contact@excellencetraining.com',
      contactPhone: '+1-555-0456'
    }
  });

  console.log('✅ Providers created');

  // Create Trainer Users and Trainer Profiles
  const trainerUsers = [];
  for (let i = 0; i < 3; i++) {
    const trainerUser = await prisma.user.create({
      data: {
        email: `trainer${i + 1}@company.com`,
        password: await bcrypt.hash('password123', 12),
        firstName: `Trainer${i + 1}`,
        lastName: 'Expert',
        employeeId: `TRN00${i + 1}`,
        department: 'Training',
        grade: 'L4',
        role: 'TRAINER'
      }
    });

    const trainer = await prisma.trainer.create({
      data: {
        userId: trainerUser.id,
        providerId: i === 0 ? internalProvider.id : externalProvider.id,
        specializations: [
          'Leadership Development',
          'Communication Skills',
          'Problem Solving',
          'Technical Training'
        ].slice(0, Math.floor(Math.random() * 3) + 2),
        bio: `Experienced trainer with over ${5 + i * 2} years in professional development and skill enhancement.`
      }
    });

    trainerUsers.push({ user: trainerUser, trainer });
  }

  console.log('✅ Trainers created');

  // Create Plans
  const plans = await Promise.all([
    prisma.plan.create({
      data: {
        name: 'Leadership Development Program',
        description: 'Comprehensive leadership training for managers and senior employees',
        status: 'ACTIVE',
        createdBy: adminUser.id
      }
    }),
    prisma.plan.create({
      data: {
        name: 'Technical Skills Enhancement',
        description: 'Advanced technical training for engineering teams',
        status: 'ACTIVE',
        createdBy: adminUser.id
      }
    }),
    prisma.plan.create({
      data: {
        name: 'Management Excellence Program (MEP)',
        description: 'Executive management training program',
        status: 'ACTIVE',
        createdBy: adminUser.id
      }
    })
  ]);

  console.log('✅ Plans created');

  // Create Courses
  const courses = [];
  for (const plan of plans) {
    const planCourses = await Promise.all([
      prisma.course.create({
        data: {
          planId: plan.id,
          name: `${plan.name.split(' ')[0]} Foundation`,
          description: `Foundation course for ${plan.name}`,
          duration: 16,
          status: 'ACTIVE'
        }
      }),
      prisma.course.create({
        data: {
          planId: plan.id,
          name: `Advanced ${plan.name.split(' ')[0]}`,
          description: `Advanced topics in ${plan.name}`,
          duration: 24,
          status: 'ACTIVE'
        }
      })
    ]);
    courses.push(...planCourses);
  }

  console.log('✅ Courses created');

  // Create Certificate Template
  const certificateTemplate = await prisma.certificateTemplate.create({
    data: {
      name: 'Standard Certificate Template',
      description: 'Default certificate template for course completion',
      templateData: {
        layout: 'standard',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        logoUrl: '/assets/company-logo.png',
        fields: {
          title: 'Certificate of Completion',
          studentName: '{{studentName}}',
          courseName: '{{courseName}}',
          completionDate: '{{completionDate}}',
          trainerName: '{{trainerName}}',
          certificateNumber: '{{certificateNumber}}'
        }
      }
    }
  });

  console.log('✅ Certificate template created');

  // Create Rounds and Sessions
  const rounds = [];
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    const trainer = trainerUsers[i % trainerUsers.length];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (i * 14)); // Stagger rounds
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 14); // 2-week courses

    const round = await prisma.round.create({
      data: {
        courseId: course.id,
        name: `${course.name} - Round ${Math.floor(i / 2) + 1}`,
        trainerId: trainer.trainer.id,
        providerId: trainer.trainer.providerId,
        maxSeats: 20,
        enrolledCount: 0,
        startDate,
        endDate,
        deliveryMode: i % 3 === 0 ? 'IN_PERSON' : i % 3 === 1 ? 'VIRTUAL' : 'HYBRID',
        venue: i % 3 === 0 ? `Training Room ${i + 1}` : undefined,
        teamsLink: i % 3 !== 0 ? `https://teams.microsoft.com/l/meetup-join/meeting-${i + 1}` : undefined,
        status: 'SCHEDULED'
      }
    });

    // Create Sessions for each round
    const sessionsPerRound = 5;
    for (let sessionNum = 1; sessionNum <= sessionsPerRound; sessionNum++) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(sessionDate.getDate() + (sessionNum - 1) * 3); // Every 3 days

      await prisma.session.create({
        data: {
          roundId: round.id,
          sessionNumber: sessionNum,
          date: sessionDate,
          startTime: '09:00',
          endTime: '17:00',
          venue: round.venue,
          teamsLink: round.teamsLink
        }
      });
    }

    rounds.push(round);
  }

  console.log('✅ Rounds and sessions created');

  // Create Plan Assignments
  const employees = sampleUsers.filter(user => user.role === 'EMPLOYEE');
  for (let i = 0; i < Math.min(employees.length, 15); i++) {
    const employee = employees[i];
    const plan = plans[i % plans.length];
    const assignmentDate = new Date();
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 6); // 6 months to complete

    await prisma.planAssignment.create({
      data: {
        userId: employee.id,
        planId: plan.id,
        assignedBy: adminUser.id,
        assignedAt: assignmentDate,
        dueDate,
        status: 'ASSIGNED'
      }
    });
  }

  console.log('✅ Plan assignments created');

  // Create Sample Enrollments
  for (let i = 0; i < Math.min(rounds.length, 10); i++) {
    const round = rounds[i];
    const enrollmentCount = Math.floor(Math.random() * 8) + 5; // 5-12 enrollments per round
    
    for (let j = 0; j < enrollmentCount; j++) {
      const employee = employees[j % employees.length];
      
      try {
        await prisma.enrollment.create({
          data: {
            userId: employee.id,
            roundId: round.id,
            status: 'ENROLLED',
            enrolledAt: new Date(),
            attendancePercentage: 0
          }
        });

        // Update round enrolled count
        await prisma.round.update({
          where: { id: round.id },
          data: {
            enrolledCount: {
              increment: 1
            }
          }
        });
      } catch (error) {
        // Skip if user already enrolled in this round
        continue;
      }
    }
  }

  console.log('✅ Sample enrollments created');

  // Create some notifications
  const notifications = [
    {
      type: 'PLAN_ASSIGNED',
      title: 'New Training Plan Assigned',
      message: 'You have been assigned to the Leadership Development Program'
    },
    {
      type: 'ROUND_ADDED',
      title: 'New Training Round Available',
      message: 'A new round for Leadership Foundation course is now available for enrollment'
    },
    {
      type: 'REMINDER',
      title: 'Training Reminder',
      message: 'Your training session starts tomorrow at 9:00 AM'
    }
  ];

  for (const notif of notifications) {
    for (let i = 0; i < 5; i++) {
      const user = sampleUsers[i];
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: notif.type as any,
          channel: 'IN_APP',
          title: notif.title,
          message: notif.message,
          isRead: Math.random() > 0.5,
          sentAt: new Date()
        }
      });
    }
  }

  console.log('✅ Sample notifications created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Login Credentials:');
  console.log(`Admin: ${config.admin.email} / ${config.admin.password}`);
  console.log('Sample users: employee1@company.com / password123');
  console.log('Sample manager: manager1@company.com / password123');
  console.log('Sample trainer: trainer1@company.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 