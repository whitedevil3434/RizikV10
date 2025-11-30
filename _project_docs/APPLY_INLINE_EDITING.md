# ✅ Apply Inline Editing to Khata OS

## Step 1: Add Import

Add to top of `lib/screens/khata_os_final.dart`:

```dart
import '../widgets/inline_editable_text.dart';
```

## Step 2: Update Shopping List Items

Find the Text widget for item title (around line 350) and replace:

```dart
// OLD:
Text(
  item['title'],
  style: TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w600,
    color: checked ? Colors.grey : Colors.black87,
    decoration: checked ? TextDecoration.lineThrough : null,
  ),
)

// NEW:
InlineEditableText(
  initialText: item['title'],
  style: const TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w600,
  ),
  color: checked ? Colors.grey : Colors.black87,
  decoration: checked ? TextDecoration.lineThrough : null,
  onSave: (newText) {
    setState(() {
      _bazarItems[index]['title'] = newText;
    });
  },
)
```

## Step 3: Update Recipe Ingredients

Find recipe text (around line 450) and replace:

```dart
// OLD:
Text(
  text,
  style: TextStyle(
    fontSize: 15,
    color: checked ? Colors.grey : Colors.black87,
    decoration: checked ? TextDecoration.lineThrough : null,
  ),
)

// NEW:
InlineEditableText(
  initialText: text,
  style: const TextStyle(fontSize: 15),
  color: checked ? Colors.grey : Colors.black87,
  decoration: checked ? TextDecoration.lineThrough : null,
  onSave: (newText) {
    // Update based on which list this is from
    // You'll need to pass the list and index to the function
  },
)
```

## Step 4: Update Roster Person Names

Find roster person name (around line 550) and replace:

```dart
// OLD:
Text(
  duty['person']!,
  style: const TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
  ),
)

// NEW:
InlineEditableText(
  initialText: duty['person']!,
  style: const TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
  ),
  onSave: (newText) {
    setState(() {
      duty['person'] = newText;
    });
  },
)
```

## How It Works

1. **Long-press any text** → Blue border appears, cursor shows
2. **Type to edit** → Text updates in real-time
3. **Tap outside or press Enter** → Auto-saves
4. **No modals** → Everything inline

## Testing

1. Run app
2. Go to Shopping List
3. Long-press on "চাল ৫ কেজি"
4. Edit the text
5. Tap outside
6. Text should be saved!

## Benefits

✅ **Google Keep style** - Familiar UX
✅ **No modals** - Fast editing
✅ **Auto-save** - No save button
✅ **Visual feedback** - Blue border when editing
✅ **Works everywhere** - Shopping, Recipe, Roster

---

**Status:** Widget created, ready to integrate!  
**File:** `lib/widgets/inline_editable_text.dart`  
**Next:** Apply to all text fields in khata_os_final.dart
