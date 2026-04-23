import React, { useState, useEffect, useRef } from 'react';
import API from "../../api.js";

// const JobSearch = () => {
//   const [jobs, setJobs] = useState([]); // எப்போதுமே ஆரம்பத்தில் ஒரு காலி Array []
//   const [loading, setLoading] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);

//   const [filters, setFilters] = useState({
//     profile: '',
//     location: '',
//     wfh: false,
//     partTime: false,
//     salary: '',
//     experience: ''
//   });

//   // 🔄 பக்கம் லோட் ஆகும் போது இயங்கும்
//   useEffect(() => {
//     fetchJobs('Full Stack Developer', ''); // ஆரம்பத்தில் காட்ட வேண்டிய வேலை
//   }, []);

//   const handleFilterChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFilters({
//       ...filters,
//       [name]: type === 'checkbox' ? checked : value
//     });
//   };

//   // 🛠️ பொதுவான ஃபெட்ச் பங்க்ஷன் (Initial load மற்றும் Search இரண்டுக்கும் இதுவே போதும்)
//   const fetchJobs = async (queryParam, locationParam) => {
//     setLoading(true);
//     try {
//       const response = await API.get(`/search-jobs`, { 
//         params: { 
//           query: queryParam || filters.profile, 
//           location: locationParam !== undefined ? locationParam : filters.location,
//           experience: filters.experience,
//           wfh: filters.wfh
//         } 
//       });

//       // 🛡️ Safety Check: டேட்டா Array-ஆக இருந்தால் மட்டுமே செட் செய்யவும்
//       if (Array.isArray(response.data)) {
//         setJobs(response.data);
//       } else {
//         console.error("Data is not an array:", response.data);
//         setJobs([]); // எரர் வந்தால் காலி Array செட் செய்யவும்
//       }
//     } catch (error) {
//       console.error("Fetch Error:", error);
//       setJobs([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = () => {
//     fetchJobs(); // பில்டர் மதிப்புகளை வைத்துத் தேடும்
//     setShowFilters(false);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-3xl font-extrabold text-center mb-10 text-gray-900 tracking-tight">Global Job Portal</h1>

//         {/* --- Search Bar --- */}
//         <div className="flex bg-white rounded-xl shadow-sm border p-2 mb-6 items-center">
//           <input 
//             type="text" 
//             name="profile"
//             className="flex-1 p-3 outline-none text-gray-700 bg-transparent"
//             placeholder="e.g. React Developer, Chennai"
//             value={filters.profile}
//             onChange={handleFilterChange}
//             onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//           />
//           <button onClick={() => setShowFilters(!showFilters)} className="p-3 text-gray-500 hover:text-blue-600">
//             <span className="text-xl">⚙️</span>
//           </button>
//           <button onClick={handleSearch} className="bg-[#00A5EC] text-white p-3 rounded-lg hover:bg-blue-500 shadow-md">
//             <span className="px-2">🔍</span>
//           </button>
//         </div>

//         {/* --- Filter Layout --- */}
//         {showFilters && (
//           <div className="bg-white border rounded-xl shadow-xl p-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2">Profile</label>
//                 <input name="profile" type="text" placeholder="e.g. Node.js" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" value={filters.profile} onChange={handleFilterChange} />
//               </div>
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
//                 <input name="location" type="text" placeholder="e.g. Bangalore" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" value={filters.location} onChange={handleFilterChange} />
//               </div>
//               <div className="flex gap-6 items-center">
//                 <label className="flex items-center gap-2 cursor-pointer text-gray-600">
//                   <input type="checkbox" name="wfh" checked={filters.wfh} onChange={handleFilterChange} className="w-4 h-4" /> WFH
//                 </label>
//                 <label className="flex items-center gap-2 cursor-pointer text-gray-600">
//                   <input type="checkbox" name="partTime" checked={filters.partTime} onChange={handleFilterChange} className="w-4 h-4" /> Part-time
//                 </label>
//               </div>
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2">Experience</label>
//                 <select name="experience" className="w-full p-3 border rounded-lg outline-none bg-white" value={filters.experience} onChange={handleFilterChange}>
//                   <option value="">Any</option>
//                   <option value="0">Fresher</option>
//                   <option value="2">2+ Years</option>
//                 </select>
//               </div>
//             </div>
//             <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
//               <button onClick={() => setFilters({ profile: '', location: '', wfh: false, partTime: false, salary: '', experience: '' })} className="text-gray-500 font-semibold px-4 py-2 hover:bg-gray-100 rounded-lg">Clear All</button>
//               <button onClick={handleSearch} className="bg-[#00A5EC] text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-600">Apply Filters</button>
//             </div>
//           </div>
//         )}

//         {/* --- Results Section --- */}
//         <div className="space-y-4">
//           <h2 className="text-lg font-bold text-gray-700 mb-4 px-2">
//             {filters.profile ? `Results for "${filters.profile}"` : "Jobs you might like"}
//           </h2>
          
//           {loading ? (
//             <div className="flex flex-col items-center py-20">
//                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00A5EC]"></div>
//                <p className="mt-4 text-gray-400 italic">Searching...</p>
//             </div>
//           ) : (
//             // Array-ஆக இருந்தால் மட்டுமே மேப் செய்யும்
//             Array.isArray(jobs) && jobs.length > 0 ? (
//               jobs.map((job, index) => (
//                 <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                   <div className="flex-1">
//                     <h3 className="font-bold text-xl text-gray-800 leading-tight">{job.title}</h3>
//                     <p className="text-[#00A5EC] font-semibold text-lg">{job.company}</p>
//                     <div className="flex flex-wrap gap-2 mt-3">
//                       <span className="text-gray-500 text-xs bg-gray-100 px-3 py-1 rounded-full font-medium">📍 {job.location || "Remote"}</span>
//                       <span className="text-gray-400 text-xs font-bold px-3 py-1 border rounded-full uppercase tracking-widest">{job.source}</span>
//                     </div>
//                   </div>
//                   <button className="w-full sm:w-auto bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all transform active:scale-95">
//                     View Details
//                   </button>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
//                 <p className="text-gray-400">No jobs found. Try changing your keywords.</p>
//               </div>
//             )
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JobSearch;import React, { useState, useEffect } from 'react';


// const JobSearch = () => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);
//   const [selectedJob, setSelectedJob] = useState(null); // Modal-க்காக

//   const [filters, setFilters] = useState({
//     profile: '',
//     location: '',
//     wfh: false,
//     experience: ''
//   });

//   useEffect(() => {
//     fetchJobs('Full Stack Developer', '');
//   }, []);

//   const handleFilterChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFilters({ ...filters, [name]: type === 'checkbox' ? checked : value });
//   };

//   const fetchJobs = async (queryParam, locationParam) => {
//     setLoading(true);
//     try {
//       const response = await API.get(`/search-jobs`, { 
//         params: { 
//           query: queryParam || filters.profile, 
//           location: locationParam !== undefined ? locationParam : filters.location,
//           experience: filters.experience,
//           wfh: filters.wfh
//         } 
//       });
//       if (Array.isArray(response.data)) setJobs(response.data);
//     } catch (error) {
//       console.error("Fetch Error:", error);
//       setJobs([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = () => {
//     fetchJobs();
//     setShowFilters(false);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 relative">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-3xl font-extrabold text-center mb-10 text-gray-900 tracking-tight">Global Job Portal</h1>

//         {/* --- Search Bar --- */}
//         <div className="flex bg-white rounded-xl shadow-sm border p-2 mb-6 items-center">
//           <input 
//             type="text" 
//             name="profile"
//             className="flex-1 p-3 outline-none text-gray-700 bg-transparent"
//             placeholder="Search Jobs (e.g. React, Node)..."
//             value={filters.profile}
//             onChange={handleFilterChange}
//             onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//           />
//           <button onClick={() => setShowFilters(!showFilters)} className="p-3 text-gray-500 hover:text-blue-600 text-xl">⚙️</button>
//           <button onClick={handleSearch} className="bg-[#00A5EC] text-white p-3 rounded-lg hover:bg-blue-500 shadow-md">🔍</button>
//         </div>

//         {/* --- Filter Layout --- */}
//         {showFilters && (
//           <div className="bg-white border rounded-xl shadow-xl p-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
//              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                <div>
//                  <label className="block text-sm font-bold text-gray-700 mb-2">Profile</label>
//                  <input name="profile" type="text" className="w-full p-3 border rounded-lg" value={filters.profile} onChange={handleFilterChange} />
//                </div>
//                <div>
//                  <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
//                  <input name="location" type="text" className="w-full p-3 border rounded-lg" value={filters.location} onChange={handleFilterChange} />
//                </div>
//              </div>
//              <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
//                <button onClick={handleSearch} className="bg-[#00A5EC] text-white px-8 py-2 rounded-lg font-bold">Apply Filters</button>
//              </div>
//           </div>
//         )}

//         {/* --- Results Section --- */}
//         <div className="space-y-4">
//           {loading ? (
//             <div className="flex flex-col items-center py-20">
//                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00A5EC]"></div>
//             </div>
//           ) : (
//             jobs.length > 0 ? (
//               jobs.map((job, index) => (
//                 <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                   <div className="flex-1">
//                     <h3 className="font-bold text-xl text-gray-800 leading-tight">{job.title}</h3>
//                     <p className="text-[#00A5EC] font-semibold text-lg">{job.company}</p>
//                     <div className="flex flex-wrap gap-2 mt-3">
//                       <span className="text-gray-500 text-xs bg-gray-100 px-3 py-1 rounded-full">📍 {job.location}</span>
//                       <span className={`text-xs font-bold px-3 py-1 border rounded-full uppercase tracking-widest ${job.applyType === 'internal' ? 'border-green-400 text-green-600' : 'border-gray-300 text-gray-400'}`}>
//                         {job.source}
//                       </span>
//                     </div>
//                   </div>

//                   {/* --- Condition Based Button --- */}
//                   {job.applyType === 'internal' ? (
//                     <button 
//                       onClick={() => setSelectedJob(job)}
//                       className="w-full sm:w-auto bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
//                     >
//                       Quick Apply
//                     </button>
//                   ) : (
//                     <a 
//                       href={job.url} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="w-full sm:w-auto text-center bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all"
//                     >
//                       Apply Now
//                     </a>
//                   )}
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-20 bg-white rounded-3xl border border-dashed">No jobs found.</div>
//             )
//           )}
//         </div>
//       </div>

//       {/* --- QUICK APPLY MODAL (For Internal Jobs) --- */}
//       {selectedJob && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-200">
//             <div className="flex justify-between items-start mb-6">
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900">Apply for Position</h2>
//                 <p className="text-blue-600 font-medium">{selectedJob.title} @ {selectedJob.company}</p>
//               </div>
//               <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
//             </div>
            
//             <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Application Sent Successfully!"); setSelectedJob(null); }}>
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
//                 <input required type="text" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-green-400" placeholder="Yasir..." />
//               </div>
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
//                 <input required type="email" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-green-400" placeholder="yasir@example.com" />
//               </div>
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-1">Upload Resume</label>
//                 <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50">
//                   <span className="text-gray-400">Click to upload PDF or Doc</span>
//                 </div>
//               </div>
//               <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 shadow-xl shadow-green-100 transition-all">
//                 Submit Application
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default JobSearch;



// const JobSearch = () => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [isApplyModal, setIsApplyModal] = useState(false);
//   const [applying, setApplying] = useState(false);
//   const [resume, setResume] = useState(null);
//   const fileInputRef = useRef(null);

// //   const [filters, setFilters] = useState({
// //     profile: '',
// //     location: '',
// //     wfh: false,
// //     salary: '',
// //     experience: '' // EXPERIENCE FILTER ADDED
// //   });
// const [filters, setFilters] = useState({
//   profile: '',
//   location: '',
//   wfh: false,
//   partTime: false, // New from image
//   salary: '',      // New from image
//   experience: ''   
// });

//   useEffect(() => {
//     fetchJobs();
    
//   }, []);

//   const handleFilterChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFilters({ ...filters, [name]: type === 'checkbox' ? checked : value });
//   };
// const fetchJobsmouse = async () => {
//   setLoading(true);

//   try {
//     let museLevel = "";

//     // ✅ FIXED mapping
//     if (filters.experience === "Fresher") {
//       museLevel = "Entry Level";
//     } else if (filters.experience === "5+ Years") {
//       museLevel = "Senior Level";
//     }

//     const response = await API.get(`/search-muse-jobs`, { 
//       params: { 
//         query: filters.profile, 
//         location: filters.location,
//         experience: filters.experience, // optional
//         level: museLevel
//       } 
//     });

//     if (Array.isArray(response.data)) {
//       setJobs(prev => [...prev, ...response.data]);
//     }

//   } catch (error) {
//     console.error("Muse Fetch Error:", error);
//   } finally {
//     setLoading(false);
//   }
// };
//  const fetchJobs = async () => {
//   setLoading(true);
//   try {
//     const response = await API.get(`/search-jobs`, { 
//       params: { 
//         query: filters.profile, 
//         location: filters.location,
//         experience: filters.experience,
//         wfh: filters.wfh,
//         partTime: filters.partTime, // Sending Part-time status
//         salary: filters.salary      // Sending Salary requirement
//       } 
//     });
//     if (Array.isArray(response.data)) setJobs(response.data);
//   } catch (error) {
//     setJobs([]);
//   } finally {
//     setLoading(false);
//     setShowFilters(false);
//   }
// };

//   const handleApplyClick = (job, e) => {
//     if (e) e.stopPropagation();
//     if (job.applyType === 'external') {
//       window.open(job.url, '_blank', 'noopener,noreferrer');
//     } else {
//       setSelectedJob(job);
//       setIsApplyModal(true);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans text-gray-900 text-left">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-3xl font-extrabold text-center mb-10 tracking-tight text-gray-800 uppercase italic">Job Search Portal</h1>

//         {/* --- Search Bar --- */}
//         <div className="flex bg-white rounded-xl shadow-md border p-1 mb-6 items-center max-w-2xl mx-auto">
//           <input 
//             type="text" name="profile" className="flex-1 p-4 outline-none bg-transparent"
//             placeholder="Search Jobs (e.g. React, Node)..." value={filters.profile} onChange={handleFilterChange}
//           />
//           <button   onClick={() => {
//     fetchJobs();
//     fetchJobsmouse?.(); // optional safety
//   }} className="bg-[#00A5EC] text-white p-3 rounded-lg hover:bg-blue-500 mr-1">🔍</button>
//         </div>

//         {/* --- Filter Trigger --- */}
//         <div className="text-center mb-8">
//             <button onClick={() => setShowFilters(true)} className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 hover:text-blue-800 transition-all">
//                 ⚙️ Refine Search & Experience
//             </button>
//         </div>

//         {/* --- Updated Filter Modal --- */}
//        {showFilters && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
//           <div className="bg-white w-full max-w-md rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
//             <div className="flex justify-between items-center p-4 border-b">
//               <h2 className="text-lg font-bold text-gray-700 w-full text-center">Filters</h2>
//               <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-red-500 text-2xl absolute right-4">✕</button>
//             </div>
            
//             <div className="p-6 space-y-5">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-600 mb-1">Profile</label>
//                 <input name="profile" placeholder="e.g, Marketing" className="w-full p-2 border rounded outline-none focus:border-blue-400" value={filters.profile} onChange={handleFilterChange} />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-600 mb-1">Location</label>
//                 <input name="location" placeholder="e.g, Delhi" className="w-full p-2 border rounded outline-none focus:border-blue-400" value={filters.location} onChange={handleFilterChange} />
//               </div>

//               <div className="space-y-2 py-1">
//                 <label className="flex items-center gap-3 cursor-pointer">
//                   <input type="checkbox" name="wfh" checked={filters.wfh} onChange={handleFilterChange} className="w-4 h-4 accent-[#00A5EC]" />
//                   <span className="text-sm text-gray-600">Work from home</span>
//                 </label>
//                 <label className="flex items-center gap-3 cursor-pointer">
//                   <input type="checkbox" name="partTime" checked={filters.partTime} onChange={handleFilterChange} className="w-4 h-4 accent-[#00A5EC]" />
//                   <span className="text-sm text-gray-600">Part-time</span>
//                 </label>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-600 mb-1">Annual salary (in lakhs)</label>
//                 <input name="salary" placeholder="At least ₹ 4 lakhs" className="w-full p-2 border rounded outline-none focus:border-blue-400" value={filters.salary} onChange={handleFilterChange} />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-600 mb-1">Years of experience</label>
//                 <select name="experience" className="w-full p-2 border rounded bg-white outline-none focus:border-blue-400 text-gray-400 text-sm" value={filters.experience} onChange={handleFilterChange}>
//                   <option value="">Select years of experience</option>
//                   <option value="0">Fresher</option>
//                   <option value="1">1 Year</option>
//                   <option value="2">2 Years</option>
//                   <option value="3">3 Years</option>
//                   <option value="5">5+ Years</option>
//                 </select>
//               </div>
//             </div>

//             <div className="p-4 border-t flex justify-end gap-6 items-center">
//               <button onClick={() => setFilters({profile:'', location:'', wfh:false, partTime:false, salary:'', experience:''})} className="text-[#00A5EC] font-bold text-sm">Clear All</button>
//               <button onClick={fetchJobs} className="bg-[#00A5EC] text-white px-8 py-2 rounded font-bold shadow-sm hover:bg-blue-600">Apply</button>
//             </div>
//           </div>
//         </div>
//       )}
//         {/* --- Job List --- */}
//  <div className="grid gap-4">
//   {loading ? (
//     <div className="text-center py-20 text-blue-500 font-bold animate-pulse text-lg">
//       🚀 Finding best matches from all sources...
//     </div>
//   ) : jobs.length > 0 ? (
//     jobs.map((job, idx) => (
//       <div key={job.id || idx} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all group">
//         <div className="flex justify-between items-start">
//           <div className="w-full">
//             <div className="flex items-center gap-2 mb-1">
//               <h3 className="font-bold text-xl text-gray-800 group-hover:text-blue-600">
//                 {job.title}
//               </h3>
              
//               {/* Dynamic Source Label with specific colors */}
//               <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
//                 job.source === 'The Muse' ? 'bg-purple-100 text-purple-600' : 
//                 job.source === 'RemoteOK' ? 'bg-blue-100 text-blue-600' : 
//                 'bg-orange-100 text-orange-600'
//               }`}>
//                 {job.source || 'Adzuna'}
//               </span>
//             </div>

//             <p className="text-gray-500 font-semibold mb-4">{job.company}</p>
            
//             {/* Meta Information */}
//             <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400 font-bold mb-6 italic">
//               <span>📍 {job.location || "Remote / India"}</span>
//               <span>💼 {job.experience || "Entry/Mid Level"}</span>
//               <span>💰 {job.salary || "Best in Industry"}</span>
//             </div>

//             <div className="flex gap-3">
//               <button 
//                 onClick={(e) => handleApplyClick(job, e)} 
//                 className="bg-[#00A5EC] text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:scale-105 transition-transform shadow-md"
//               >
//                 {job.applyType === 'external' ? 'Apply Now ↗' : 'Quick Apply'}
//               </button>
//               <button 
//                 onClick={() => { setSelectedJob(job); setIsApplyModal(false); }} 
//                 className="text-gray-600 border border-gray-300 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors"
//               >
//                 View Details
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     ))
//   ) : (
//     <div className="text-center py-20 text-gray-400 font-medium border-2 border-dashed rounded-xl">
//       No jobs found. Try adjusting your filters.
//     </div>
//   )}
// </div>
//       </div>

//       {/* --- Detailed Modal with Openings & Applicants --- */}
//       {selectedJob && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
//           <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
//             <button onClick={() => setSelectedJob(null)} className="absolute top-6 right-6 text-gray-400 text-3xl hover:text-red-500">✕</button>
            
//             {!isApplyModal ? (
//               <div>
//                 <h2 className="text-3xl font-black text-gray-900 mb-1">{selectedJob.title}</h2>
//                 <p className="text-blue-600 font-bold text-lg mb-6">{selectedJob.company}</p>
                
//                 {/* KEY STATS AREA */}
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
//                     <div><span className="text-[10px] text-blue-400 font-black block uppercase">Location</span> <span className="text-sm font-bold text-gray-700">{selectedJob.location || "Remote"}</span></div>
//                     <div><span className="text-[10px] text-blue-400 font-black block uppercase">Min Experience</span> <span className="text-sm font-bold text-gray-700">{selectedJob.experience || "3-5 Years"}</span></div>
//                     <div><span className="text-[10px] text-blue-400 font-black block uppercase">Applicants</span> <span className="text-sm font-bold text-orange-600">{Math.floor(Math.random() * 50) + 10} Applied</span></div>
//                     <div><span className="text-[10px] text-blue-400 font-black block uppercase">Openings</span> <span className="text-sm font-bold text-green-600">{selectedJob.openings || "01"} Available</span></div>
//                 </div>

//                 <div className="mb-8">
//                   <h4 className="font-bold text-gray-800 mb-3 text-lg border-b-2 border-blue-500 inline-block">Full Description</h4>
//                   <div className="text-gray-600 text-sm leading-relaxed space-y-2 mt-4" dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
                  
//                   {/* USER REMINDER FOR SPAM CHECK */}
//                   <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-xs text-yellow-800 font-bold italic">
//                     💡 Note: Please mention the word "EXHILARATION" in your application to verify you've read the full post.
//                   </div>
//                 </div>

//                 <button onClick={() => handleApplyClick(selectedJob)} className="w-full bg-[#00A5EC] text-white py-4 rounded-xl font-black text-xl shadow-xl hover:bg-blue-600 active:scale-95 transition-all">
//                    {selectedJob.applyType === 'external' ? 'Continue to Application ↗' : 'Apply via Portal'}
//                 </button>
//               </div>
//             ) : (
//               <div className="text-center">
//                 <h2 className="text-2xl font-black mb-2">Application Form</h2>
//                 <p className="text-gray-400 mb-8 uppercase text-xs font-bold tracking-widest">{selectedJob.company}</p>
//                 <form className="space-y-4 text-left">
//                   <input required className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400" placeholder="Full Name" />
//                   <input required type="email" className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400" placeholder="Email" />
//                   <textarea className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400" placeholder="Tell us why you're a fit (Hint: Include the keyword if required)"></textarea>
//                   <button className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700">Submit Application</button>
//                   <button type="button" onClick={() => setIsApplyModal(false)} className="w-full text-gray-400 font-bold text-sm">Cancel</button>
//                 </form>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default JobSearch;



const JobPortal = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ query: '', location: 'Chennai', experience: '0' });
    
    const [viewingJob, setViewingJob] = useState(null); 
    const [showApplyForm, setShowApplyForm] = useState(false);

    useEffect(() => {
        autoFetchInitialJobs();
    }, []);

    const autoFetchInitialJobs = async () => {
        setLoading(true);
        try {
            const res = await API.get('/search-jobs', { params: { query: 'React', location: 'Chennai', experience: '0' } });
            setJobs(res.data);
        } catch (err) { console.error("Initial load failed"); }
        setLoading(false);
    };

    const handleManualSearch = async () => {
        setLoading(true);
        try {
            const res = await API.get('/search-jobs', { params: filters });
            setJobs(res.data);
        } catch (err) { console.error("Search failed"); }
        setLoading(false);
    };

    const handleJobAction = (job) => {
        if (job.source === 'Adzuna') {
            window.open(job.url, '_blank'); 
        } else {
            setViewingJob(job); 
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 min-h-screen bg-gray-50 font-sans">
            <h1 className="text-4xl font-black mb-8 text-blue-700 italic tracking-tighter uppercase">Job Finder Pro</h1>

            {/* --- Filter Section --- */}
            <div className="flex flex-wrap gap-4 mb-10 p-6 bg-white shadow-2xl rounded-[2.5rem] border border-gray-100">
                <input className="flex-[2] min-w-[200px] border-none bg-gray-100 p-5 rounded-3xl focus:ring-2 focus:ring-blue-400 outline-none font-bold" 
                       placeholder="Role (e.g Node.js)" 
                       onChange={e => setFilters({...filters, query: e.target.value})} />
                
                <input className="flex-1 min-w-[150px] border-none bg-gray-100 p-5 rounded-3xl focus:ring-2 focus:ring-blue-400 outline-none font-bold" 
                       placeholder="City" 
                       onChange={e => setFilters({...filters, location: e.target.value})} />

                <select 
                    className="flex-1 min-w-[150px] border-none bg-gray-100 p-5 rounded-3xl focus:ring-2 focus:ring-blue-400 outline-none font-black text-blue-600"
                    onChange={e => setFilters({...filters, experience: e.target.value})}
                >
                    <option value="0">Fresher</option>
                    <option value="2">2+ Years</option>
                    <option value="5">5+ Years</option>
                </select>

                <button onClick={handleManualSearch} className="bg-blue-600 text-white px-12 py-5 rounded-3xl font-black hover:bg-blue-700 shadow-xl transition-all">
                    SEARCH
                </button>
            </div>

            {/* --- Job Feed --- */}
            <div className="grid gap-6">
                {loading ? (
                    <div className="text-center py-20 font-black text-gray-400 animate-pulse">⚡ LOADING LIVE JOBS...</div>
                ) : (
                    jobs.map((job, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-wrap justify-between items-center gap-6 hover:shadow-xl transition-all">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full ${job.source === 'Adzuna' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>{job.source}</span>
                                    <span className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">Posted: {job.posted}</span>
                                </div>
                                <h2 className="text-2xl font-black text-gray-800 mb-1">{job.title}</h2>
                                <p className="text-blue-500 font-extrabold text-lg mb-4">{job.company}</p>
                                <div className="flex flex-wrap gap-3 text-xs font-bold text-gray-500">
                                    <span className="bg-gray-100 px-3 py-1.5 rounded-lg">📍 {job.location}</span>
                                    <span className="bg-gray-100 px-3 py-1.5 rounded-lg">💼 {job.experienceRequired}</span>
                                </div>
                            </div>
                            <button onClick={() => handleJobAction(job)} className={`px-10 py-5 rounded-2xl font-black text-sm shadow-lg transition-all ${job.source === 'Adzuna' ? 'bg-orange-500 text-white' : 'bg-gray-900 text-white'}`}>
                                {job.source === 'Adzuna' ? 'APPLY DIRECT ↗' : 'VIEW DETAILS'}
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* --- [MODAL] DETAILED JOB VIEW --- */}
            {viewingJob && !showApplyForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300">
                        
                        {/* Modal Header */}
                        <div className="p-10 border-b relative bg-blue-50/20">
                            <button onClick={() => setViewingJob(null)} className="absolute top-8 right-8 bg-white shadow-md p-3 rounded-full hover:text-red-500">✕</button>
                            <h2 className="text-3xl font-black text-gray-900 leading-tight pr-12">{viewingJob.title}</h2>
                            <p className="text-xl text-blue-600 font-black mt-1">{viewingJob.company}</p>
                        </div>

                        {/* Modal Content - Extensive Details */}
                        <div className="p-10 overflow-y-auto flex-1 space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Estimated Salary</p>
                                    <p className="font-black text-emerald-600">{viewingJob.salary || "Best in Industry"}</p>
                                </div>
                                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Vacancies</p>
                                    <p className="font-black text-gray-700">0{Math.floor(Math.random() * 5) + 1} Openings</p>
                                </div>
                                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Applicants</p>
                                    <p className="font-black text-orange-600">{Math.floor(Math.random() * 40) + 12} People Applied</p>
                                </div>
                                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Deadline</p>
                                    <p className="font-black text-red-500">Apply within 7 days</p>
                                </div>
                                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Job Type</p>
                                    <p className="font-black text-blue-700">Full-Time / Remote</p>
                                </div>
                                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Location</p>
                                    <p className="font-black text-gray-700">{viewingJob.location}</p>
                                </div>
                            </div>

                            {/* Required Skills */}
                            {viewingJob.tags && (
                                <div>
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Required Expertise</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {viewingJob.tags.map(tag => (
                                            <span key={tag} className="bg-white border-2 border-gray-100 text-gray-600 px-5 py-2 rounded-2xl text-[10px] font-black uppercase hover:border-blue-300">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Detailed Description */}
                            <div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Detailed Description</h3>
                                <div 
                                    className="text-gray-600 leading-relaxed text-sm bg-gray-50 p-8 rounded-[2rem] border border-gray-100 font-medium" 
                                    dangerouslySetInnerHTML={{ __html: viewingJob.description }} 
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-10 bg-white border-t flex gap-5">
                            <button onClick={() => setViewingJob(null)} className="flex-1 py-5 font-black text-gray-400">CANCEL</button>
                            <button onClick={() => setShowApplyForm(true)} className="flex-[3] bg-blue-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-blue-100 hover:scale-[1.02] transition-transform">
                                QUICK APPLY NOW
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Application Form (Remains the Same) --- */}
            {showApplyForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white p-10 rounded-[3.5rem] w-full max-w-md shadow-2xl animate-in slide-in-from-bottom duration-500">
                         <h2 className="text-3xl font-black mb-2">Final Step</h2>
                         <p className="text-gray-400 font-bold mb-8 italic uppercase text-[10px]">Applying for {viewingJob?.company}</p>
                         <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Successfully Applied!"); setShowApplyForm(false); setViewingJob(null); }}>
                             <input className="w-full bg-gray-50 border-none p-5 rounded-3xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Full Name" required />
                             <input className="w-full bg-gray-50 border-none p-5 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" type="email" placeholder="Email" required />
                             <div className="border-4 border-dashed border-gray-100 p-12 rounded-[2.5rem] text-center hover:bg-blue-50 cursor-pointer">
                                 <p className="text-blue-600 font-black text-sm">DROP CV HERE</p>
                             </div>
                             <div className="flex gap-4">
                                <button type="button" onClick={() => setShowApplyForm(false)} className="flex-1 font-bold text-gray-400">BACK</button>
                                <button className="flex-[2] bg-gray-900 text-white py-5 rounded-3xl font-black shadow-2xl uppercase tracking-widest">SUBMIT</button>
                             </div>
                         </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobPortal;