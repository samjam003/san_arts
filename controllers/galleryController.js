const { supabase } = require("../config/supabase");

const getAllMainCategories = async (req, res) => {
  try {
    console.log("Fetching main categories...");
    // Fetch all main categories from the database

    const { data: main_categories, error } = await supabase
      .from("main_categories")
      .select("*");

    // Check for errors in the query

    if (error) {
      console.error("Error fetching main categories:", error);
      return res.status(500).json({ error: "Error fetching main categories" });
    }

    res.status(200).json(main_categories);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

const getAllSubCategories = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const { data: subCategories, error } = await supabase
      .from("subcategories")
      .select("*")
      .eq("main_category_id", categoryId);

    if (error) {
      console.error("Error fetching subcategories:", error);
      return res.status(500).json({ error: "Error fetching subcategories" });
    }

    res.status(200).json(subCategories);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

const getFiltersBySubCategory = async (req, res) => {
  const { subCategoryId } = req.params;

  try {
    const { data: filters, error } = await supabase
      .from("Filters")
      .select("*")
      .eq("subcategory_id", subCategoryId);

    if (error) {
      console.error("Error fetching filters:", error);
      return res.status(500).json({ error: "Error fetching filters" });
    }

    res.status(200).json(filters);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

//without pagination
// const getImagesBySubcategory = async (req, res) => {
//   const { subCategoryId } = req.params;

//   try {
//     const { data: imgData, error } = await supabase
//       .from("art_images")
//       .select(
//         `
//         id,
//         img_url,
//         img_title,
//         description,
//         created_at,
//         main_categories(category_name),
//         subcategories(subcategory_name)
//       `
//       )
//       .eq("subcategory_id", subCategoryId);

//     if (error) {
//       console.error("Error fetching images:", error);
//       return res.status(500).json({ error: "Error fetching images" });
//     }

//     res.status(200).json(imgData);
//   } catch (err) {
//     console.error("Unexpected error:", err);
//     res.status(500).json({ error: "An unexpected error occurred" });
//   }
// };

//with pagination
const getImagesBySubcategory = async (req, res) => {
  const { subCategoryId } = req.params;
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 items per page
  console.log("categoryId", subCategoryId);
  // Calculate pagination range
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const {
      data: imgData,
      count,
      error,
    } = await supabase
      .from("art_images")
      .select(
        `
        id, 
        img_url, 
        img_title, 
        description, 
        likes,
        created_at,
        main_categories(category_name),
        subcategories(subcategory_name)
      `,
        { count: "exact" } // This ensures count is returned
      )
      .eq("subcategory_id", subCategoryId)
      .range(from, to); // Apply pagination

    if (error) {
      console.error("Error fetching images:", error);
      return res.status(500).json({ error: "Error fetching images" });
    }

    res.status(200).json({
      page,
      pageSize,
      totalRecords: count || 0, // Handle case where count might be null
      totalPages: Math.ceil((count || 0) / pageSize),
      data: imgData,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

//OR filter
const getFilteredImages = async (req, res) => {
  const { subcategory_id, filters } = req.body;
  console.log("Received filter request:", { subcategory_id, filters });

  try {
    console.log("Fetching initial images for subcategory:", subcategory_id);
    let { data: allImages, error: initialError } = await supabase
      .from("art_images")
      .select("*")
      .eq("subcategory_id", subcategory_id);

    if (initialError) {
      console.error("Initial query error:", initialError);
      return res.status(400).json({ error: initialError });
    }

    console.log("Initial images count:", allImages?.length);
    // 
    // If filters are provided
    if (filters && Object.keys(filters).length > 0) {
      console.log("Processing filters:", filters);
      let allMatchingIds = new Set();

      for (const [filterId, values] of Object.entries(filters)) {
        if (values && values.length > 0) {
          console.log(
            `Fetching matches for filter ${filterId} with values:`,
            values
          );
          const { data: matchingImages, error: filterError } = await supabase
            .from("filter_value")
            .select("img_id")
            .eq("filter_id", filterId)
            .in("value", values);

          if (filterError) {
            console.error("Filter query error:", filterError);
            return res.status(400).json({ error: filterError });
          }

          console.log(
            `Found ${matchingImages?.length} matches for filter ${filterId}`
          );
          matchingImages.forEach((img) => allMatchingIds.add(img.img_id));
        }
      }

      console.log("Total unique matching image IDs:", allMatchingIds.size);
      // Keep only images whose ID is in the union of all matching image IDs
      const filteredImages = allImages.filter((img) =>
        allMatchingIds.has(img.id)
      );
      console.log("Final filtered images count:", filteredImages.length);

      // Sort by creation date
      filteredImages.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      return res.json(filteredImages || []);
    }

    // If no filters, return all subcategory images sorted
    console.log("No filters provided, returning all images");
    allImages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.json(allImages || []);
  } catch (err) {
    console.error("Gallery filter error:", err);
    return res
      .status(500)
      .json({ message: "Server error", details: err.message });
  }
};

//AND  filter
// const getFilteredImages = async (req, res) => {
//   const { subcategory_id, filters } = req.body;

//   try {
//     // Start with selecting all images in the subcategory
//     let { data: filteredImages, error: initialError } = await supabase
//       .from('art_images')
//       .select('*')
//       .eq('subcategory_id', subcategory_id);

//     if (initialError) {
//       console.error('Initial query error:', initialError);
//       return res.status(400).json({ error: initialError });
//     }

//     // If we have filters, apply them by fetching matching image IDs first
//     if (filters && Object.keys(filters).length > 0) {
//       // For each filter type
//       for (const [filterId, values] of Object.entries(filters)) {
//         if (values && values.length > 0) {
//           // Get all image IDs that match this filter
//           const { data: matchingImages, error: filterError } = await supabase
//             .from('filter_value')
//             .select('img_id')
//             .eq('filter_id', filterId)
//             .in('value', values);

//           if (filterError) {
//             console.error('Filter query error:', filterError);
//             return res.status(400).json({ error: filterError });
//           }

//           // Extract the matching image IDs
//           const matchingImageIds = matchingImages.map(img => img.img_id);

//           // Filter our current results to only include images that match this filter
//           filteredImages = filteredImages.filter(img =>
//             matchingImageIds.includes(img.id)
//           );
//         }
//       }

//     }

//     // Sort results by creation date (newest first)
//     filteredImages.sort((a, b) =>
//       new Date(b.created_at) - new Date(a.created_at)
//     );

//     return res.json(filteredImages || []);
//   } catch (err) {
//     console.error('Gallery filter error:', err);
//     return res.status(500).json({ message: 'Server error', details: err.message });
//   }
// };

const getArtworkById = async (req, res) => {
  const id = req.params.artworkId; // art_images.id
  console.log("this artworf:", id);
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  // Step 1: Fetch image and its category/subcategory
  const { data: imageData, error: imageError } = await supabase
    .from("art_images")
    .select(
      `
      *,
      main_categories(id, category_name),
      subcategories(id, subcategory_name)
    `
    )
    .eq("id", id)
    .single();

  if (imageError || !imageData) {
    return res.status(404).json({ error: "Image not found" });
  }

  // Step 2: Fetch filter values + filter names for this image
  const { data: filterData, error: filterError } = await supabase
    .from("filter_value")
    .select(
      `
      value,
      filter_id,
      Filters(filter_name)
    `
    )
    .eq("img_id", id);

  if (filterError) {
    return res.status(500).json({ error: "Error fetching filters" });
  }

  // Format filters
  const filters = filterData.map((f) => ({
    filter_id: f.filter_id,
    filter_name: f.Filters?.filter_name || null,
    value: f.value,
  }));

  console.log(imageData);

  // Final response
  return res.status(200).json({
    image: {
      id: imageData.id,
      img_url: imageData.img_url,
      img_title: imageData.img_title,
      description: imageData.description,
      created_at: imageData.created_at,
      sub_images: imageData.sub_images,
    },
    main_category: imageData.main_categories,
    subcategory: imageData.subcategories,
    filters,
  });
};

const toggleLike = async (req, res) => {
  try {
    const { artworkID } = req.params;
    const { flag } = req.body; // true = like, false = dislike

    if (!artworkID || typeof flag !== "boolean") {
      return res
        .status(400)
        .json({ error: "artworkID and flag (boolean) are required" });
    }

    // Get current like count
    const { data: artwork, error: fetchError } = await supabase
      .from("art_images")
      .select("likes")
      .eq("id", artworkID)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!artwork) return res.status(404).json({ error: "Artwork not found" });

    let newLikes = artwork.likes || 0;

    if (flag) {
      newLikes += 1; // increment
    } else {
      newLikes = Math.max(0, newLikes - 1); // decrement but never below 0
    }

    // Update in DB
    const { data, error: updateError } = await supabase
      .from("art_images")
      .update({ likes: newLikes })
      .eq("id", artworkID)
      .select("likes")
      .maybeSingle();

    if (updateError) throw updateError;

    res.json({ success: true, likes: data.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const fetchLikes = async (req, res) => {
  const { artworkID } = req.params;

  try {
    const { data, error } = await supabase
      .from("art_images")
      .select("likes")
      .eq("id", artworkID)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Artwork not found" });

    res.json({ likes: data.likes || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  getArtworkById,
  getAllMainCategories,
  getAllSubCategories,
  getFiltersBySubCategory,
  getImagesBySubcategory,
  getFilteredImages,
  toggleLike,
  fetchLikes
};
