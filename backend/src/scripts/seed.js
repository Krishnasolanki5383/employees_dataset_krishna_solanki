// src/scripts/seed.js
// Purpose: Seeds the employees collection in MongoDB using the JSON dataset.
//          Performs idempotent clean-and-insert of the dataset with proper mapping.

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Configure environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { connect } = require('../config/db');
const Employee = require('../models/employeeModel');

const DATASET_PATH = path.resolve(__dirname, '../../data/Employees_Dataset (1).json');

async function seed() {
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('🚀 Starting Employee Database Seeding Process');
    console.log('═══════════════════════════════════════════════════');

    // 1. Establish DB Connection
    await connect();

    // 2. Read JSON dataset
    console.log(`\n📂 Reading dataset file: ${DATASET_PATH}`);
    if (!fs.existsSync(DATASET_PATH)) {
      throw new Error(`Dataset file not found at: ${DATASET_PATH}`);
    }
    const rawData = fs.readFileSync(DATASET_PATH, 'utf8');
    const parsedData = JSON.parse(rawData);
    
    const employeesList = parsedData.employees;
    if (!Array.isArray(employeesList)) {
      throw new Error('Invalid JSON format: "employees" array not found');
    }
    console.log(`✅ Loaded ${employeesList.length} employees from JSON.`);

    // 3. Clear existing employees collection (for idempotency)
    console.log('\n🧹 Clearing existing records in employees collection...');
    const deleteResult = await Employee.deleteMany({});
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing employees.`);

    // 4. Map and clean dataset entries
    console.log('\n🧹 Transforming and cleaning data records...');
    const transformedEmployees = [];
    const seenEmails = new Set();
    let duplicateEmailsResolved = 0;

    for (const emp of employeesList) {
      const profile = emp.profile || {};
      const contact = profile.contact || {};
      const address = contact.address || {};
      const location = address.location || {};
      const geo = location.geo || {};
      const timezone = geo.timezone || {};
      
      // Clean phone number (split at extension/x and strip invalid characters)
      let rawPhone = contact.phone || '';
      let cleanedPhone = '';
      if (rawPhone) {
        cleanedPhone = rawPhone.split(/x|ext/i)[0].replace(/[^+\d\s\-().]/g, '').trim();
      }

      // Map projects & tasks lists
      const projectsList = profile.projects || [];
      const projectStrings = [];
      const taskStrings = [];
      let employeeSkills = null;

      for (const proj of projectsList) {
        // Collect formatted project string: "ID - Name"
        if (proj.projectId && proj.name) {
          projectStrings.push(`${proj.projectId} - ${proj.name}`);
        }

        const tasksList = proj.tasks || [];
        for (const task of tasksList) {
          // Collect formatted task string: "ID - Description"
          if (task.taskId && task.description) {
            taskStrings.push(`${task.taskId} - ${task.description}`);
          }

          // Extract employee skills & details from the assigned task matching their ID
          if (task.assignedTo && task.assignedTo.id === emp.id && !employeeSkills) {
            employeeSkills = task.assignedTo.skills || {};
          }
        }
      }

      // Extract skills components
      const primarySkill = employeeSkills?.primary || '';
      const secondarySkill = Array.isArray(employeeSkills?.secondary) 
        ? employeeSkills.secondary.join(', ') 
        : '';
      
      const expObj = employeeSkills?.experience || {};
      const experience = expObj.years || 0;
      const domain = Array.isArray(expObj.domains)
        ? expObj.domains.join(', ')
        : '';

      const certsObj = expObj.certifications || {};
      const certifications = Array.isArray(certsObj.current) ? certsObj.current : [];
      const isVerified = certsObj.meta?.verified === true;

      // Handle duplicate email constraint by appending a suffix
      let email = (contact.email || '').trim().toLowerCase();
      if (seenEmails.has(email)) {
        duplicateEmailsResolved++;
        const parts = email.split('@');
        let counter = 2;
        while (seenEmails.has(`${parts[0]}_${counter}@${parts[1]}`)) {
          counter++;
        }
        email = `${parts[0]}_${counter}@${parts[1]}`;
      }
      seenEmails.add(email);

      // Construct final mongoose document structure
      const record = {
        name: emp.name,
        email: email,
        phone: cleanedPhone || undefined,
        city: address.city || undefined,
        state: location.state || undefined,
        country: location.country || undefined,
        timezone: timezone.name || undefined,
        primarySkill: primarySkill || undefined,
        secondarySkill: secondarySkill || undefined,
        domain: domain || undefined,
        experience,
        certifications,
        projects: projectStrings,
        tasks: taskStrings,
        isVerified,
      };

      transformedEmployees.push(record);
    }

    console.log(`✅ Successfully transformed ${transformedEmployees.length} records.`);
    if (duplicateEmailsResolved > 0) {
      console.log(`ℹ️ Resolved ${duplicateEmailsResolved} duplicate email address constraints.`);
    }

    // 5. Bulk insert in chunks to avoid overloading memory/DB channel
    console.log('\n💾 Bulk inserting records into MongoDB...');
    const chunkSize = 1000;
    let insertedCount = 0;
    
    for (let i = 0; i < transformedEmployees.length; i += chunkSize) {
      const chunk = transformedEmployees.slice(i, i + chunkSize);
      const result = await Employee.insertMany(chunk, { ordered: false });
      insertedCount += result.length;
      console.log(`   - Inserted chunk ${Math.floor(i / chunkSize) + 1}: +${result.length} records (${insertedCount}/${transformedEmployees.length})`);
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`🎉 Success! Seeding completed.`);
    console.log(`📊 Total employees added to DB: ${insertedCount}`);
    console.log('═══════════════════════════════════════════════════');

  } catch (error) {
    console.error('\n❌ Seeding failed with error:');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

seed();
