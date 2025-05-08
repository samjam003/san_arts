const { supabase } = require("../config/supabase");

const addMainCategory = async (req, res) => {
  // Extract category name and description from the request body
  const { category_name, description } = req.body;

  // Check if required fields are present
  if (!category_name || !description) {
    return res
      .status(400)
      .json({ message: "Category name and description are required." });
  }

  try {
    // Insert data into the "main_categories" table
    const { data, error } = await supabase
      .from("main_categories")
      .insert([
        {
          category_name: category_name,
          description: description,
        },
      ])
      .select() // To return the inserted data
      .single(); // We are expecting a single object to be returned

    // Check for any errors returned by Supabase
    if (error) {
      return res
        .status(500)
        .json({ message: "Error inserting category", error: error.message });
    }

    // Log the activity
    await logActivity(
      "create",
      `New category "${category_name}" was added`,
      "category",
      data.id
    );

    // If everything went well, return the inserted data
    res.status(201).json(data);
  } catch (err) {
    // Catch any unexpected errors
    res
      .status(500)
      .json({ message: "Unexpected error occurred", error: err.message });
  }
};

const logActivity = async (actionType, description, entityType, entityId) => {
  try {
    await supabase
      .from("activity_log")
      .insert([
        {
          action_type: actionType,
          description,
          entity_type: entityType,
          entity_id: entityId
        }
      ]);
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

const addImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const {
      img_title,
      description,
      main_category_id,
      subcategory_id,
      filterValues, // could be null, undefined, or an array
    } = req.body;

    console.log(" filterValues:", filterValues);

    // Insert the image into art_images table
    const { data: insertedImage, error: insertImageError } = await supabase
      .from("art_images")
      .insert([
        {
          img_title,
          img_url: req.file.path,
          description,
          main_category_id,
          subcategory_id,
        },
      ])
      .select()
      .single();

    if (insertImageError) {
      console.error("Error inserting image:", insertImageError);
      return res.status(500).json({
        success: false,
        message: "Failed to insert image data",
      });
    }

    // Log the activity
    await logActivity(
      "create",
      `New image "${img_title}" was added`,
      "image",
      insertedImage.id
    );

    let parsedFilterValues = filterValues;

    if (typeof filterValues === "string") {
      try {
        parsedFilterValues = JSON.parse(filterValues);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid filterValues JSON format",
        });
      }
    }

    if (Array.isArray(parsedFilterValues) && parsedFilterValues.length > 0) {
      const filterInsertData = parsedFilterValues.map((item) => ({
        img_id: insertedImage.id,
        filter_id: item.filter_id,
        value: item.value,
      }));
      console.log("Preparing to insert filter values:", filterInsertData);

      const { error: filterInsertError } = await supabase
        .from("filter_value")
        .insert(filterInsertData);

      if (filterInsertError) {
        console.error("Error inserting filter values:", filterInsertError);
        return res.status(500).json({
          success: false,
          message: "Image inserted but failed to insert filter values",
        });
      }
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: insertedImage,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Error uploading image",
      error: error.message,
    });
  }
};

const addSubcategory = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "no background image provided",
      });
    }

    const { categoryId, subcategory_name, description } = req.body;

    // Check for required fields
    if (!categoryId || !subcategory_name || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("subcategories")
      .insert([
        {
          main_category_id: categoryId,
          subcategory_name: subcategory_name,
          description: description,
          background_img: req.file.path,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Log the activity
    await logActivity(
      "create",
      `New subcategory "${subcategory_name}" was added`,
      "subcategory",
      data.id
    );

    res.status(200).json(data);
  } catch (err) {
    console.error("Error adding subcategory:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addFilter = async (req, res) => {
  try {
    const { filter_name, description, values, subcategory_id } = req.body;

    if (!filter_name || !values || !subcategory_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data: newFilter, error } = await supabase
      .from("Filters")
      .insert([
        {
          filter_name: filter_name,
          values: values, // Array of values
          subcategory_id: subcategory_id,
          description: description,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Log the activity
    await logActivity(
      "create",
      `New filter "${filter_name}" was added`,
      "filter",
      newFilter.id
    );

    return res.status(200).json(newFilter);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "An error occurred while adding the filter." });
  }
};

const updateMainCategory = async (req, res) => {
  const { id } = req.params;
  const { category_name, description } = req.body;

  if (!category_name || !description) {
    return res
      .status(400)
      .json({ message: "Category name and description are required." });
  }

  try {
    const { data, error } = await supabase
      .from("main_categories")
      .update({
        category_name,
        description,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res
        .status(500)
        .json({ message: "Error updating category", error: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Log the activity
    await logActivity(
      "update",
      `Category "${category_name}" was updated`,
      "category",
      id
    );

    res.status(200).json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Unexpected error occurred", error: err.message });
  }
};

const deleteMainCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Get category name before deleting
    const { data: categoryData } = await supabase
      .from("main_categories")
      .select("category_name")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("main_categories")
      .delete()
      .eq("id", id);

    if (error) {
      return res
        .status(500)
        .json({ message: "Error deleting category", error: error.message });
    }

    // Log the activity
    await logActivity(
      "delete",
      `Category "${categoryData?.category_name || 'Unknown'}" was deleted`,
      "category",
      id
    );

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Unexpected error occurred", error: err.message });
  }
};

const updateSubcategory = async (req, res) => {
  const { id } = req.params;
  const { main_category_id, subcategory_name, description } = req.body;
  const background_img = req.file ? req.file.path : undefined;

  if (!subcategory_name || !main_category_id) {
    return res
      .status(400)
      .json({ message: "Subcategory name and main category are required." });
  }

  try {
    const updateData = {
      main_category_id,
      subcategory_name,
      description,
      ...(background_img && { background_img })
    };

    const { data, error } = await supabase
      .from("subcategories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res
        .status(500)
        .json({ message: "Error updating subcategory", error: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    // Log the activity
    await logActivity(
      "update",
      `Subcategory "${subcategory_name}" was updated`,
      "subcategory",
      id
    );

    res.status(200).json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Unexpected error occurred", error: err.message });
  }
};

const deleteSubcategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Get subcategory name before deleting
    const { data: subcategoryData } = await supabase
      .from("subcategories")
      .select("subcategory_name")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("subcategories")
      .delete()
      .eq("id", id);

    if (error) {
      return res
        .status(500)
        .json({ message: "Error deleting subcategory", error: error.message });
    }

    // Log the activity
    await logActivity(
      "delete",
      `Subcategory "${subcategoryData?.subcategory_name || 'Unknown'}" was deleted`,
      "subcategory",
      id
    );

    res.status(200).json({ message: "Subcategory deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Unexpected error occurred", error: err.message });
  }
};

const getAllSubcategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("subcategories")
      .select(`
        *,
        main_categories (
          id,
          category_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return res
        .status(500)
        .json({ message: "Error fetching subcategories", error: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Unexpected error occurred", error: err.message });
  }
};

const updateFilter = async (req, res) => {
  const { id } = req.params;
  const { filter_name, values, subcategory_id, description } = req.body;

  if (!filter_name || !values || !subcategory_id) {
    return res
      .status(400)
      .json({ message: "Filter name, values, and subcategory are required." });
  }

  try {
    const { data, error } = await supabase
      .from("Filters")
      .update({
        filter_name,
        values,
        subcategory_id,
        description
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res
        .status(500)
        .json({ message: "Error updating filter", error: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: "Filter not found" });
    }

    // Log the activity
    await logActivity(
      "update",
      `Filter "${filter_name}" was updated`,
      "filter",
      id
    );

    res.status(200).json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Unexpected error occurred", error: err.message });
  }
};

const deleteFilter = async (req, res) => {
  const { id } = req.params;

  try {
    // Get filter name before deleting
    const { data: filterData } = await supabase
      .from("Filters")
      .select("filter_name")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("Filters")
      .delete()
      .eq("id", id);

    if (error) {
      return res
        .status(500)
        .json({ message: "Error deleting filter", error: error.message });
    }

    // Log the activity
    await logActivity(
      "delete",
      `Filter "${filterData?.filter_name || 'Unknown'}" was deleted`,
      "filter",
      id
    );

    res.status(200).json({ message: "Filter deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Unexpected error occurred", error: err.message });
  }
};

const getAllFilters = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Filters")
      .select(`
        *,
        subcategories (
          id,
          subcategory_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return res
        .status(500)
        .json({ message: "Error fetching filters", error: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Unexpected error occurred", error: err.message });
  }
};

const getFiltersBySubcategory = async (req, res) => {
  const { subcategoryId } = req.params;

  try {
    const { data, error } = await supabase
      .from("Filters")
      .select("*")
      .eq("subcategory_id", subcategoryId);

    if (error) {
      return res.status(500).json({ message: "Error fetching filters", error: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Unexpected error occurred", error: err.message });
  }
};

const getAllImages = async (req, res) => {
  try {
    // First fetch all images
    const { data: images, error: imagesError } = await supabase
      .from("art_images")
      .select(`
        *,
        main_categories(category_name),
        subcategories(subcategory_name)
      `)
      .order("created_at", { ascending: false });

    if (imagesError) {
      return res.status(500).json({ message: "Error fetching images", error: imagesError.message });
    }

    // For each image, fetch its filter values
    const imagesWithFilters = await Promise.all(
      images.map(async (image) => {
        const { data: filterValues, error: filterError } = await supabase
          .from("filter_value")
          .select(`
            value,
            filter_id,
            Filters(filter_name)
          `)
          .eq("img_id", image.id);

        if (filterError) {
          console.error(`Error fetching filter values for image ${image.id}:`, filterError);
          return image;
        }

        return {
          ...image,
          filterValues: filterValues.map(fv => ({
            filter_id: fv.filter_id,
            value: fv.value
          }))
        };
      })
    );

    res.status(200).json(imagesWithFilters);
  } catch (err) {
    res.status(500).json({ message: "Unexpected error occurred", error: err.message });
  }
};

const updateImage = async (req, res) => {
  const { id } = req.params;
  const {
    img_title,
    description,
    main_category_id,
    subcategory_id,
    filterValues: rawFilterValues,
  } = req.body;

  console.log("Update Image Request:", {
    id,
    body: req.body,
    file: req.file
  });

  try {
    // Start a transaction
    const updateData = {
      img_title,
      description,
      main_category_id,
      subcategory_id,
      ...(req.file && { img_url: req.file.path }),
    };

    console.log("Update Data:", updateData);

    const { data: image, error: imageError } = await supabase
      .from("art_images")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (imageError) {
      console.error("Image Update Error:", imageError);
      return res.status(500).json({
        success: false,
        message: "Failed to update image",
        error: imageError.message,
      });
    }

    // Delete existing filter values
    const { error: deleteError } = await supabase
      .from("filter_value")
      .delete()
      .eq("img_id", id);

    if (deleteError) {
      console.error("Filter Values Delete Error:", deleteError);
      return res.status(500).json({
        success: false,
        message: "Failed to delete existing filter values",
        error: deleteError.message,
      });
    }

    // Parse filter values
    let parsedFilterValues = [];
    if (rawFilterValues) {
      try {
        parsedFilterValues = typeof rawFilterValues === 'string'
          ? JSON.parse(rawFilterValues)
          : rawFilterValues;
      } catch (err) {
        console.error("Filter Values Parse Error:", err);
        return res.status(400).json({
          success: false,
          message: "Invalid filterValues JSON format",
        });
      }
    }

    console.log("Parsed Filter Values:", parsedFilterValues);

    // Insert new filter values if provided
    if (Array.isArray(parsedFilterValues) && parsedFilterValues.length > 0) {
      const filterInsertData = parsedFilterValues.map((item) => ({
        img_id: id,
        filter_id: item.filter_id,
        value: item.value,
      }));

      console.log("Filter Insert Data:", filterInsertData);

      const { error: filterInsertError } = await supabase
        .from("filter_value")
        .insert(filterInsertData);

      if (filterInsertError) {
        console.error("Filter Values Insert Error:", filterInsertError);
        return res.status(500).json({
          success: false,
          message: "Failed to insert new filter values",
          error: filterInsertError.message,
        });
      }
    }

    // Fetch the updated image with its filter values
    const { data: updatedImage, error: fetchError } = await supabase
      .from("art_images")
      .select(`
        *,
        main_categories(category_name),
        subcategories(subcategory_name)
      `)
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Fetch Updated Image Error:", fetchError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch updated image",
        error: fetchError.message,
      });
    }

    // Fetch filter values
    const { data: filterValues, error: filterError } = await supabase
      .from("filter_value")
      .select(`
        value,
        filter_id,
        Filters(filter_name)
      `)
      .eq("img_id", id);

    if (filterError) {
      console.error("Fetch Filter Values Error:", filterError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch filter values",
        error: filterError.message,
      });
    }

    const response = {
      ...updatedImage,
      filterValues: filterValues.map(fv => ({
        filter_id: fv.filter_id,
        value: fv.value
      }))
    };

    console.log("Update Response:", response);

    // Log the activity
    await logActivity(
      "update",
      `Image "${img_title}" was updated`,
      "image",
      id
    );

    res.status(200).json(response);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating image",
      error: error.message,
    });
  }
};

const deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    // Get image title before deleting
    const { data: imageData } = await supabase
      .from("art_images")
      .select("img_title")
      .eq("id", id)
      .single();

    // Delete filter values first
    const { error: filterError } = await supabase
      .from("filter_value")
      .delete()
      .eq("img_id", id);

    if (filterError) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete filter values",
        error: filterError.message,
      });
    }

    // Delete the image
    const { error: imageError } = await supabase
      .from("art_images")
      .delete()
      .eq("id", id);

    if (imageError) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete image",
        error: imageError.message,
      });
    }

    // Log the activity
    await logActivity(
      "delete",
      `Image "${imageData?.img_title || 'Unknown'}" was deleted`,
      "image",
      id
    );

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting image",
      error: error.message,
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    // Get total categories count
    const { count: categoriesCount, error: categoriesError } = await supabase
      .from("main_categories")
      .select("*", { count: "exact", head: true });

    if (categoriesError) throw categoriesError;

    // Get total subcategories count
    const { count: subcategoriesCount, error: subcategoriesError } = await supabase
      .from("subcategories")
      .select("*", { count: "exact", head: true });

    if (subcategoriesError) throw subcategoriesError;

    // Get total images count
    const { count: imagesCount, error: imagesError } = await supabase
      .from("art_images")
      .select("*", { count: "exact", head: true });

    if (imagesError) throw imagesError;

    // Get total filters count
    const { count: filtersCount, error: filtersError } = await supabase
      .from("Filters")
      .select("*", { count: "exact", head: true });

    if (filtersError) throw filtersError;

    // Get recent uploads (last 3 images)
    const { data: recentUploads, error: recentUploadsError } = await supabase
      .from("art_images")
      .select(`
        id,
        img_url,
        img_title,
        created_at,
        main_categories(category_name)
      `)
      .order("created_at", { ascending: false })
      .limit(3);

    if (recentUploadsError) throw recentUploadsError;

    // Get recent activity (last 5 activities)
    const { data: recentActivity, error: activityError } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (activityError) throw activityError;

    res.status(200).json({
      stats: {
        categories: categoriesCount || 0,
        subcategories: subcategoriesCount || 0,
        images: imagesCount || 0,
        filters: filtersCount || 0
      },
      recentUploads,
      recentActivity
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message
    });
  }
};

module.exports = {
  addMainCategory,
  addImage,
  addSubcategory,
  addFilter,
  updateMainCategory,
  deleteMainCategory,
  updateSubcategory,
  deleteSubcategory,
  getAllSubcategories,
  updateFilter,
  deleteFilter,
  getAllFilters,
  getFiltersBySubcategory,
  getAllImages,
  updateImage,
  deleteImage,
  getDashboardStats
};
